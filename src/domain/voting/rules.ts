import { IBallot } from '../../model/ballotModel.js';
import { Types } from 'mongoose';

export abstract class BallotRule {
  abstract validate(selection: any, ballot: IBallot): Types.ObjectId[];
}

export class SingleChoiceRule extends BallotRule {
  validate(selection: any, ballot: IBallot): Types.ObjectId[] {
    const ids = Array.isArray(selection) ? selection : [selection];
    if (ids.length !== 1) throw new Error('Select exactly one option');
    const allowed = new Set(ballot.options.map((o) => String(o._id)));
    if (!allowed.has(String(ids[0])))
      throw new Error('Invalid option selected');
    return ids;
  }
}

export class MultipleChoiceRule extends BallotRule {
  validate(selection: any, ballot: IBallot): Types.ObjectId[] {
    const ids = Array.isArray(selection) ? selection : [selection];
    if (ids.length < 1) throw new Error('Select at least one option');
    const max = ballot.maxSelections || 1;
    if (ids.length > max) throw new Error(`Select at most ${max} options`);
    const allowed = new Set(ballot.options.map((o) => String(o._id)));
    for (const id of ids) {
      if (!allowed.has(String(id))) throw new Error('Invalid option selected');
    }
    return Array.from(new Set(ids));
  }
}

export const RuleRegistry: Record<string, BallotRule> = {
  single: new SingleChoiceRule(),
  multiple: new MultipleChoiceRule(),
};
