export class BallotRule {
  validate(selection, ballot) {
    throw new Error('validate() not implemented');
  }
}

export class SingleChoiceRule extends BallotRule {
  validate(selection, ballot) {
    const ids = Array.isArray(selection) ? selection : [selection];
    if (ids.length !== 1) throw new Error('Select exactly one option');
    const allowed = new Set(ballot.options.map((o) => String(o._id)));
    if (!allowed.has(String(ids[0])))
      throw new Error('Invalid option selected');
    return ids;
  }
}

export class MultipleChoiceRule extends BallotRule {
  validate(selection, ballot) {
    const ids = Array.isArray(selection) ? selection : [selection];
    if (ids.length < 1) throw new Error('Select at least one option');
    const max = ballot.maxSelections || 1;
    if (ids.length > max) throw new Error(`Select at most ${max} options`);
    const allowed = new Set(ballot.options.map((o) => String(o._id)));
    for (const id of ids) {
      if (!allowed.has(String(id))) throw new Error('Invalid option selected');
    }
    return Array.from(new Set(ids)); // dedupe
  }
}

export const RuleRegistry = {
  single: new SingleChoiceRule(),
  multiple: new MultipleChoiceRule(),
};
