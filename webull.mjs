import { untestedDummy } from './mock-data/account.mjs'
import { dummyPositions } from './mock-data/positions.mjs'

export const getAcctInfo = async () => {
  const { webullAccessToken, webullAccountId, webullDid, webullTradeToken } = process.env

  // Pre-req check
  if (!webullAccessToken) {
    throw new Error('required env var "webullAccessToken" not set')
  }
  if (!webullAccountId) {
    throw new Error('required env var "webullAccountId" not set')
  }
  if (!webullDid) {
    throw new Error('required env var "webullDid" not set')
  }
  if (!webullTradeToken) {
    throw new Error('required env var "webullTradeToken" not set')
  }

  const resp = await fetch(`https://ustrade.webullfinance.com/api/trading/v1/webull/account/accountAssetSummary/v3?secAccountId=${webullAccountId}`, {
    "headers": {
      "access_token": webullAccessToken,
      "app": "global",
      "app-group": "broker",
      "appid": "wb_web_app",
      "device-type": "Web",
      "did": webullDid,
      "hl": "en",
      "lzone": "dc_core1",
      "os": "web",
      "osv": "i9zh",
      "platform": "web",
      "reqid": "pkkb4j0uscu7llh62ktf4kz4vugxv6uw",
      "reqid": "pqy1wh1mln7nnnavojem06ruezqnd6b0",
      "sec-ch-ua": "\"Not)A;Brand\";v=\"99\", \"Google Chrome\";v=\"137\", \"Chromium\";v=\"137\"",
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": "\"macOS\"",
      "t_time": Number(new Date()),
      "t_token": webullTradeToken,
      "tz": "America/Los_Angeles",
      "ver": "5.7.1",
      "x-s": "b3832a8613fec8976d69ef00d8f5a03aeee8e2e9d9d66f603419589167b6ef45",
      "x-s": "2b061b437b3be4b0cf632f7f14cf4b53ff866aaa26768a5a3c25760fc62d9de2",
      "x-s": "936a9e3f25fa21cfcc74faa4a0a005839d969addff6fdff7d40224162ed29d08",
      "x-sv": "xodp2vg9",
      "Referer": "https://app.webull.com/",
      "Referrer-Policy": "strict-origin-when-cross-origin"
    },
  })

  const respData = await resp.json()
  const { netLiquidationValue, totalCashValue, unrealizedProfitLoss, unrealizedProfitLossRate, positions } = respData || {}
  // const { netLiquidationValue, totalCashValue, unrealizedProfitLoss, unrealizedProfitLossRate, positions } = untestedDummy || {}

  if (!netLiquidationValue || !totalCashValue) {
    throw new Error('account info not found in response json')
  }
  if (!positions) {
    throw new Error('positions data not found in response json')
  }

  return {
    // raw: respData,
    acctInfo: {
      ...respData,
      // ...untestedDummy,
      balance: netLiquidationValue,
      plIsNegative: Number(unrealizedProfitLoss) < 0,
      pl: unrealizedProfitLoss,
      plPerc: (Number(unrealizedProfitLossRate)*100).toFixed(1),
    },
    positions: positions.filter(p => Boolean(Number(p.quantity))).map(p => ({
        ...p,
        unrealizedProfitLossRate: (Number(p.unrealizedProfitLossRate)*100).toFixed(1),
        plIsNegative: Number(p.unrealizedProfitLoss) < 0,
    })),
  }
}
