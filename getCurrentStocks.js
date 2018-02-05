const yahooFinance = require("yahoo-finance");
const _ = require("lodash");
const cTable = require("console.table");

const symbols = require("./my-stocks.json").symbols;

yahooFinance.quote(
  {
    symbols: symbols,
    modules: ["price", "summaryDetail", "financialData"]
  },
  function(err, quotes) {
    if (err) {
      console.log(err);
    }

    let shares = [];

    symbols.forEach(symbol => {
      let pe, earningsYield, returnOnAssets;

      let share = quotes[symbol];

      if (share.summaryDetail) {
        pe = share.summaryDetail.trailingPE;
        earningsYield = (100 / pe).toFixed(2);
      }

      if (share.financialData) {
        returnOnAssets = (share.financialData.returnOnAssets * 100).toFixed(2);
      }

      shares.push({
        symbol: symbol.substring(0, symbol.length - 3),
        name: share.price.longName,
        earningsYield,
        returnOnAssets,
        price: share.financialData.currentPrice
      });
    });

    shares = _.chain(shares)
      .sortBy(share => parseFloat(share.earningsYield))
      .value()
      .reverse();
    shares.map((share, index) => {
      share.eRank = index + 1;
    });

    shares = _.chain(shares)
      .sortBy(share => parseFloat(share.returnOnAssets))
      .value()
      .reverse();
    shares.map((share, index) => {
      share.rRank = index + 1;
      if (share.eRank) {
        share.rank = share.eRank + share.rRank;
      }
    });

    shares = _.chain(shares)
      .sortBy("rank")
      .map(share => {
        share.RoA = share.returnOnAssets;
        delete share.returnOnAssets;
        return share;
      })
      .value();

    console.table(shares);
  }
);
