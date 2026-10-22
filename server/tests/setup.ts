import { afterAll, afterEach } from 'vitest';
import { setClock } from '../src/common/clock';
import { prisma } from '../src/common/prisma';

afterEach(() => {
  setClock(null);
});

afterAll(async () => {
  await prisma.$disconnect();
});
