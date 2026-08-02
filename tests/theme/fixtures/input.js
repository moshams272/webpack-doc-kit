/* eslint-disable */

export class OverloadedTest {
  /**
   * First overload signature.
   * @overload
   * @param {string} name A simple string parameter
   * @param {number} count A simple number parameter
   * @returns {void}
   */
  /**
   * Second overload signature.
   * @overload
   * @param {boolean} isEnabled A simple boolean parameter
   * @returns {string}
   */
  /**
   * Third overload signature.
   * @overload
   * @param {number} id A simple string parameter
   * @param {boolean} isEnabled  A simple boolean parameter
   * @returns {void}
   */
  overloadedMethod(id, isEnabled) {}
}
