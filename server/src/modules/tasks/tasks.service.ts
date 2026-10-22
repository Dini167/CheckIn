import type { Prisma, Task } from '@prisma/client';
import type { AuthUser } from '../../common/auth';
import { rules } from '../../config/rules';
import { dbToKey, keyToDb, nextWorkDay, todayKey } from '../../common/dates';
import { conflict, notFound } from '../../common/errors';
import { prisma } from '../../common/prisma';
import { liveSessionMinutes } from '../../common/worktime';
import type { z } from '../../common/zod';
import { runPlanner } from './tasks.planner';
import type { createTaskSchema, listTasksQuerySchema, updateTaskSchema } from './tasks.schemas';

export function toTaskDto(t: Task) {
  return {
    id: t.id,
    title: t.title,
    taskDate: dbToKey(t.taskDate),
    status: t.status,
    priority: t.priority,
    estimatedMinutes: t.estimatedMinutes,
    carriedOverCount: t.carriedOverCount,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
  };
}

/** Tasks are private: every query is scoped to the owner, so other users get 404. */
async function getOwnTask(user: AuthUser, id: number) {
  const task = await prisma.task.findFirst({ where: { id, userId: user.id } });
  if (!task) throw notFound('המשימה לא נמצאה');
  return task;
}

export async function listTasks(user: AuthUser, query: z.infer<typeof listTasksQuerySchema>) {
  const where: Prisma.TaskWhereInput = {
    userId: user.id,
    ...(query.allDates ? {} : { taskDate: keyToDb(query.date ?? todayKey()) }),
    ...(query.status ? { status: query.status } : {}),
    ...(query.priority ? { priority: query.priority } : {}),
    ...(query.search ? { title: { contains: query.search, mode: 'insensitive' } } : {}),
  };
  const order = query.order ?? (query.sort === 'priority' ? 'desc' : 'asc');
  const tasks = await prisma.task.findMany({
    where,
    orderBy: [{ [query.sort]: order }, { createdAt: 'asc' }],
  });
  return tasks.map(toTaskDto);
}

export async function createTask(user: AuthUser, input: z.infer<typeof createTaskSchema>) {
  const task = await prisma.task.create({
    data: {
      userId: user.id,
      title: input.title,
      estimatedMinutes: input.estimatedMinutes,
      priority: input.priority ?? 'MEDIUM',
      taskDate: keyToDb(input.taskDate ?? todayKey()),
    },
  });
  return toTaskDto(task);
}

export async function updateTask(user: AuthUser, id: number, input: z.infer<typeof updateTaskSchema>) {
  await getOwnTask(user, id);
  const task = await prisma.task.update({ where: { id }, data: input });
  return toTaskDto(task);
}

export async function deleteTask(user: AuthUser, id: number) {
  await getOwnTask(user, id);
  await prisma.task.delete({ where: { id } });
}

export async function carryOver(user: AuthUser, id: number) {
  const task = await getOwnTask(user, id);
  if (task.status === 'DONE') throw conflict('משימה שהושלמה לא מועברת למחר', 'TASK_DONE');
  const from = [dbToKey(task.taskDate), todayKey()].sort()[1]!;
  const updated = await prisma.task.update({
    where: { id },
    data: { taskDate: keyToDb(nextWorkDay(from)), carriedOverCount: { increment: 1 } },
  });
  return toTaskDto(updated);
}

export async function getPlan(user: AuthUser, dateKey = todayKey()) {
  const tasks = await prisma.task.findMany({
    where: { userId: user.id, taskDate: keyToDb(dateKey), status: { not: 'DONE' } },
  });

  let availableMinutes = rules.regularMinutesPerDay;
  if (dateKey === todayKey()) {
    const sessions = await prisma.attendanceSession.findMany({
      where: { userId: user.id, workDate: keyToDb(dateKey) },
    });
    const worked = sessions.reduce((sum, s) => sum + liveSessionMinutes(s), 0);
    availableMinutes = Math.max(0, rules.regularMinutesPerDay - worked);
  }

  const plan = await runPlanner({ tasks, availableMinutes });
  const byId = new Map(tasks.map((t) => [t.id, t]));
  const totalMinutes = tasks.reduce((sum, t) => sum + t.estimatedMinutes, 0);

  return {
    date: dateKey,
    source: plan.source,
    tasks: plan.orderedTaskIds.flatMap((id) => {
      const t = byId.get(id);
      return t ? [toTaskDto(t)] : [];
    }),
    totalMinutes,
    availableMinutes,
    overloaded: totalMinutes > availableMinutes,
    overloadMinutes: Math.max(0, totalMinutes - availableMinutes),
    suggestedToMove: plan.suggestedToMove,
    message: plan.message,
  };
}
