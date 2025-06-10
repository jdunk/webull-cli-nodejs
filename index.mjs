import 'dotenv/config'
import { getAcctInfo } from './webull.mjs'
import pushover from './pushover.js'
import chalk from 'chalk';

const ALERT_IF_OVER_PERCENT = process.env.alertIfOverPerc

const logGray = (text) => console.log(chalk.gray(text))

const appTitleAsciiArt = `
██╗    ██╗███████╗██████╗ ██╗   ██╗██╗     ██╗         ███╗   ███╗ ██████╗ ███╗   ██╗██╗████████╗ ██████╗ ██████╗ 
██║    ██║██╔════╝██╔══██╗██║   ██║██║     ██║         ████╗ ████║██╔═══██╗████╗  ██║██║╚══██╔══╝██╔═══██╗██╔══██╗
██║ █╗ ██║█████╗  ██████╔╝██║   ██║██║     ██║         ██╔████╔██║██║   ██║██╔██╗ ██║██║   ██║   ██║   ██║██████╔╝
██║███╗██║██╔══╝  ██╔══██╗██║   ██║██║     ██║         ██║╚██╔╝██║██║   ██║██║╚██╗██║██║   ██║   ██║   ██║██╔══██╗
╚███╔███╔╝███████╗██████╔╝╚██████╔╝███████╗███████╗    ██║ ╚═╝ ██║╚██████╔╝██║ ╚████║██║   ██║   ╚██████╔╝██║  ██║
 ╚══╝╚══╝ ╚══════╝╚═════╝  ╚═════╝ ╚══════╝╚══════╝    ╚═╝     ╚═╝ ╚═════╝ ╚═╝  ╚═══╝╚═╝   ╚═╝    ╚═════╝ ╚═╝  ╚═╝
                                                                                                                  `

const acctData = await getAcctInfo()

console.log(chalk.green(appTitleAsciiArt))

console.log('Bal:', `$${acctData.acctInfo.balance}`)

const fetchAccountData = async () => {
  const acctData = await getAcctInfo()
  const { acctInfo, positions } = acctData
  logGray('\n-------------------------------------------------------------------------------')
  logGray(String(new Date()).split(' GMT')[0])
  logGray('-------------------------------------------------------------------------------\n')
  console.log(chalk.gray('Bal:'), `$${acctInfo.balance}`)
  const plFormatted = `${`$${acctInfo.pl}`.padStart(10)}`
  const plColorized = acctInfo.plIsNegative ? chalk.red(plFormatted) : chalk.green(plFormatted)
  const plPercFormatted = `${acctInfo.plPerc.padStart(8)}%`
  const plPercColorized = acctInfo.plIsNegative ? chalk.red(plPercFormatted) : chalk.green(plPercFormatted)
  console.log(`${chalk.gray('Open P/L:')} ${plColorized} ${plPercColorized}`)
  console.log()

  logGray('[Positions]')

  if (!positions.length) {
    logGray('(no open positions at this time)')
    return
  }

  positions.forEach(p => {
    const { quantity, unrealizedProfitLoss, unrealizedProfitLossRate, items } = p
    const item = items[0]
    const strikePrice = item.optionExercisePrice.slice(0, -3)
    const pl = p.unrealizedProfitLoss
    const plPerc = p.unrealizedProfitLossRate
    const plFormatted = `${`$${Number(pl).toLocaleString()}`.padStart(10)}`
    const plColorized = p.plIsNegative ? chalk.red(plFormatted) : chalk.green(plFormatted)
    const plPercFormatted = `${plPerc.padStart(6)}%`
    const plPercColorized = p.plIsNegative ? chalk.red(plPercFormatted) : chalk.green(plPercFormatted)
    console.log(`${quantity} x $${strikePrice} ${item.optionType.padEnd(4)} ${plColorized} ${plPercColorized}`)

    if (Number(plPerc) > ALERT_IF_OVER_PERCENT) {
      console.log(`alert sent (profit > ${ALERT_IF_OVER_PERCENT}%)`)
      pushover.sendMessage({
        message: `P/L % > ${ALERT_IF_OVER_PERCENT}`,
        title: 'Webull alert',
      })
    }
  })
}

fetchAccountData()
setInterval(fetchAccountData, 14000)
