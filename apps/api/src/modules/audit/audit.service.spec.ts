import { PrismaService } from '../../infrastructure/database/prisma.service';
import { AuditService } from './audit.service';

describe('AuditService', () => {
  const create = jest.fn();
  const service = new AuditService({
    auditLog: { create },
  } as unknown as PrismaService);

  beforeEach(() => create.mockReset());

  it('enregistre qui a fait quoi, sur quoi et depuis quelle adresse', async () => {
    await service.record({
      actorId: 'admin-1',
      action: 'user.suspend',
      targetType: 'user',
      targetId: 'user-2',
      ip: '203.0.113.7',
    });
    expect(create).toHaveBeenCalledWith({
      data: {
        actorId: 'admin-1',
        action: 'user.suspend',
        targetType: 'user',
        targetId: 'user-2',
        metadata: {},
        ip: '203.0.113.7',
      },
    });
  });

  it('écrit dans la transaction fournie', async () => {
    const txCreate = jest.fn();
    await service.record(
      { actorId: 'a', action: 'user.approve', targetType: 'user' },
      { auditLog: { create: txCreate } } as never,
    );
    expect(txCreate).toHaveBeenCalled();
    expect(create).not.toHaveBeenCalled();
  });

  it('n’expose aucune méthode de modification ou de suppression', () => {
    const methods = Object.getOwnPropertyNames(AuditService.prototype);
    expect(methods.sort()).toEqual(['constructor', 'list', 'record']);
  });
});
