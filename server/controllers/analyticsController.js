const Speaker = require('../models/Speaker');

/**
 * GET /api/analytics/summary
 *
 * Считает вопросы по каждому спикеру на стороне MongoDB.
 * Спикер без вопросов остаётся в ответе с нулём, иначе график
 * скрыл бы тех, кому ещё ничего не написали.
 */
async function getSummary(req, res, next) {
  try {
    const rows = await Speaker.aggregate([
      {
        $lookup: {
          from: 'questions',
          localField: 'name',
          foreignField: 'speakerName',
          as: 'questions',
        },
      },
      {
        $project: {
          _id: 0,
          speaker: '$name',
          count: { $size: '$questions' },
        },
      },
      { $sort: { count: -1, speaker: 1 } },
    ]);

    res.status(200).json({
      metric: 'questionsPerSpeaker',
      title: 'Вопросы зрителей по спикерам',
      data: rows,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { getSummary };
