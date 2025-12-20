import { AuditRepository } from "./audit.repo";
import type { CreateAuditInput, ListAuditQuery } from "./audit.types";

export class AuditService {
  private repo = new AuditRepository();

  async create(input: CreateAuditInput) {
    const data: any = {
      action: input.action,
      fromValue: input.fromValue ?? null,
      toValue: input.toValue ?? null,
      actor: { connect: { id: input.actorId } },
      task: { connect: { id: input.taskId } },
    };

    return this.repo.create(data);
  }

  async list(query: ListAuditQuery) {
    return this.repo.list(query);
  }
}
