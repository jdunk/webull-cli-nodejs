const util = require('util');
const Push = require('pushover-notifications')

const p = new Push({
  user: process.env.pushoverUser,
  token: process.env.pushoverToken,
})

const send = util.promisify(p.send).bind(p)

var msgDefaults = {
  title: "Well - this is fantastic",
  sound: 'magic',
  priority: 0,
}

exports.sendMessage = async (message) => {
  const msgText = message?.message || message

  let result
  try {
    result = await send({
      ...msgDefaults,
      message: msgText,
      ...(message || {}),
    })
  } catch (err) {
    console.log('error', err)
  }

  const respData = JSON.parse(result)

  if (respData.status !== 1) {
    throw new Error('pushover notification send failed')
  }

  return respData
}