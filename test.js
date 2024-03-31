const expect = result => {
  // if (typeof result === "function") {
  //   return {
  //     toThrowErrorMatching: expected => {
  //       try {
  //         result()
  //       } catch (error) {
  //         if (error.message.includes(expected)) return
  //         throw new Error(
  //           `Expected function to throw error matching ${JSON.stringify(expected)}, but received ${
  //             error.message
  //           }`
  //         )
  //       }
  //       throw new Error("Expected function to throw, but it did not.")
  //     },
  //   }
  // }

  return {
    toEqual: expected => {
      if (JSON.stringify(result) !== JSON.stringify(expected)) {
        console.error(
          `Comparison failed, provided:\n\n` +
            `${JSON.stringify(result, null, 2)}\n\n` +
            `did not equal expected:\n\n` +
            `${JSON.stringify(expected, null, 2)}\n\n`
        )
        throw new Error("Comparison failed")
      }
    },
  }
}

const test = async (name, body) => {
  try {
    body()
  } catch (error) {
    console.error("[FAILED]", name)
    console.error(error)
    return
  }

  console.log("[PASSED]", name)
}

module.exports = { expect, test }
