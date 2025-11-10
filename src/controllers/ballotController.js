// Create or add ballot to election
export const addBallot = async (req, res, next) => {
  try {
    const { electionId } = req.params;
    const { title, description, type, maxSelections, options } = req.body || {};

    if (!title || !type || !options?.length || options.length < 2) {
      return next(
        new AppError('title, type and at least 2 options required', 400)
      );
    }

    const election = await Election.findById(electionId);
    if (!election) return next(new AppError('Election not found', 404));

    const newBallot = {
      title: title.trim(),
      description: description ? description.trim() : '',
      type,
      maxSelections: type === 'multiple' ? maxSelections || 1 : 1,
      options: options.map((o, i) => ({
        text: o.text.trim(),
        order: o.order ?? i,
      })),
    };

    election.ballots.push(newBallot);
    await election.save();

    res
      .status(201)
      .json({
        status: 'success',
        data: { ballot: election.ballots[election.ballots.length - 1] },
      });
  } catch (err) {
    next(err);
  }
};

// Get all ballots (via election)
export const listBallots = async (req, res, next) => {
  try {
    const { electionId } = req.params;
    const election = await Election.findById(electionId)
      .select('ballots')
      .lean();
    if (!election) return next(new AppError('Election not found', 404));

    res.json({
      status: 'success',
      results: election.ballots.length,
      data: { ballots: election.ballots },
    });
  } catch (err) {
    next(err);
  }
};

// Get single ballot by ID within election
export const getBallot = async (req, res, next) => {
  try {
    const { electionId, ballotId } = req.params;
    const election = await Election.findById(electionId).lean();
    if (!election) return next(new AppError('Election not found', 404));

    const ballot = election.ballots.find((b) => String(b._id) === ballotId);
    if (!ballot) return next(new AppError('Ballot not found', 404));

    res.json({ status: 'success', data: { ballot } });
  } catch (err) {
    next(err);
  }
};

// Update ballot
export const updateBallot = async (req, res, next) => {
  try {
    const { electionId, ballotId } = req.params;
    const { title, description, isActive } = req.body || {};

    const election = await Election.findById(electionId);
    if (!election) return next(new AppError('Election not found', 404));

    const ballot = election.ballots.id(ballotId);
    if (!ballot) return next(new AppError('Ballot not found', 404));

    if (title) ballot.title = title.trim();
    if (description !== undefined) ballot.description = description.trim();
    if (isActive !== undefined) ballot.isActive = isActive;

    await election.save();
    res.json({ status: 'success', data: { ballot } });
  } catch (err) {
    next(err);
  }
};

// Delete ballot
export const deleteBallot = async (req, res, next) => {
  try {
    const { electionId, ballotId } = req.params;
    const election = await Election.findById(electionId);
    if (!election) return next(new AppError('Election not found', 404));

    election.ballots.id(ballotId).remove();
    await election.save();

    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
