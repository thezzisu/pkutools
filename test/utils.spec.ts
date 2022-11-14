/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { parseFunctionArgs } from '../src/utils.js'
import { expect } from 'chai'

describe('utils.parseFunctionArgs', () => {
  it('plain function', () => {
    expect(parseFunctionArgs(function () {})).to.deep.equal([])
    expect(
      parseFunctionArgs(function (
        a: string,
        B: string,
        _c: string,
        $d: string,
        _eFg: string
      ) {})
    ).to.deep.equal(['a', 'B', '_c', '$d', '_eFg'])
  })
  it('arrow function', () => {
    expect(parseFunctionArgs(() => {})).to.deep.equal([])
    expect(
      parseFunctionArgs(
        (a: string, B: string, _c: string, $d: string, _eFg: string) => {}
      )
    ).to.deep.equal(['a', 'B', '_c', '$d', '_eFg'])
  })
  it('method', () => {
    const obj = {
      m0() {},
      m1(a: string, b: string, c: string) {},
      m2: () => {},
      m3: function (a: string, b: string, c: string) {}
    }
    expect(parseFunctionArgs(obj.m0)).to.deep.equal([])
    expect(parseFunctionArgs(obj.m1)).to.deep.equal(['a', 'b', 'c'])
    expect(parseFunctionArgs(obj.m2)).to.deep.equal([])
    expect(parseFunctionArgs(obj.m3)).to.deep.equal(['a', 'b', 'c'])
  })
  it('with comments', () => {
    expect(parseFunctionArgs(function (/* a */) {})).to.deep.equal([])
    expect(
      parseFunctionArgs(function (/* a */ a: string, /* b */ b: string) {})
    ).to.deep.equal(['a', 'b'])
  })
})
