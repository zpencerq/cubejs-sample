const safeDivSql = (numerator, denominator) =>
  `${numerator} / NULLIF(CAST((${denominator}) AS INT), 0)`;
const averageDaysInMonth = 30.44;

cube(`Users`, {
  sql: `SELECT * FROM user_day`,

  measures: {
    activationsInPast12Months: {
      sql: isActivated,
      type: `sum`,
      rollingWindow: { trailing: `12 month` },
    },

    daysPerActivationPastYear: {
      sql: safeDivSql(`365.0`, activationsInPast12Months),
      type: `number`,
    },

    newInboundCount: {
      sql: userId,
      type: `countDistinct`,
      filters: [{ sql: `${isInbound} = 1` }],
    },
    predictedMonthlyActivations: {
      sql: `${newInboundCount} * ${daysPerActivationPastYear} / ${averageDaysInMonth}`,
      type: `number`,
    },

    newInboundCount2: {
      sql: isInbound,
      type: `sum`,
    },
    predictedMonthlyActivations2: {
      sql: `${newInboundCount2} * ${daysPerActivationPastYear} / ${averageDaysInMonth}`,
      type: `number`,
    },
  },

  dimensions: {
    day: {
      sql: `${CUBE}.day`,
      type: `time`,
    },

    userId: {
      sql: `${CUBE}.user_id`,
      type: `string`,
    },

    isInbound: {
      sql: `${CUBE}.is_inbound`,
      type: `number`,
    },

    isActivated: {
      sql: `${CUBE}.is_activated`,
      type: `number`,
    },
  },

  refreshKey: {
    every: `1 day`,
  },

  dataSource: "default",
});
