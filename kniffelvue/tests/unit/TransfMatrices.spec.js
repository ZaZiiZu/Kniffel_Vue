import TransfMatrices from '@/components/TransfMatrices'
import {
  mount
} from '@vue/test-utils'

describe('TransfMatrices_test', () => {
  // Now mount the component and you have the wrapper
  const wrapper = mount(TransfMatrices)
  // console.log(wrapper.vm)
  describe('constants exist', () => {

    test('settings exist', () => {
      expect(wrapper.vm.settings).toBeTruthy()
    })
    test('alternatives exist', () => {
      expect(wrapper.vm.settings.alternatives).toBeTruthy()
    })
  })
  describe('constants are valid', () => {
    test('alternatives is a number', () => {
      expect(wrapper.vm.settings.alternatives).toBeNumber()
    })
    test('alternatives is >0', () => {
      expect(wrapper.vm.settings.alternatives).toBeGreaterThan(0)
    })

  })
  const alts_start = 2
  const alts_end = 5
  const rolls_start = 3
  const rolls_end = 9
  for (let i = alts_start; i <= alts_end; i++) {
    for (let j = rolls_start; j <= rolls_end; j++) {
      console.log('test for: ', i, j)
      describe(`matrix for ${i} alts and ${j} size seems valid`, () => {
        let result = wrapper.vm.get_transM(i, j)
        test('matrix exists', () => {
          expect(result).toBeTruthy()
        })
        console.log('test for: ', i, j)
        let passLength = Object.keys(result).length == j

        test('length seems fine', () => {
          expect(passLength).toBeTruthy()
        })

        let passDepth = Object.keys(result[Object.keys(result)[0]]).length == j
        test('depth also seems fine', () => {
          expect(passDepth).toBeTruthy()
        })
        test('rows have sums of one', () => {
          let objectKeySum = wrapper.vm.sumArrayKey(Object.values(result[1]), 'normOdds')
          expect(objectKeySum).toBeCloseTo(1)
        })
      })
    }
  }
  console.log('total tests should be: ', (alts_end - alts_start + 1) * (rolls_end - rolls_start + 1) * 4)

  it.skip('has a button', () => {
    expect(wrapper.contains('button')).toMatch(/[\d]/)
  })
  it.skip('button should increment the count', () => {
    expect(wrapper.vm.count).toBe(0)
    const button = wrapper.find('button')
    button.trigger('click')
    expect(wrapper.vm.count).toBe(1)
  })
})





expect.extend({
  toBeNumber(received, argument) {
    const pass = Number.isInteger(received) === true;
    if (pass) {
      return {
        message: () =>
          `expected ${received} to be Integer`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to not be Integer`,
        pass: false
      }
    }
  }
})
expect.extend({
  toBeDivisibleBy(received, argument) {
    const pass = received % argument == 0;
    if (pass) {
      return {
        message: () =>
          `expected ${received} not to be divisible by ${argument}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be divisible by ${argument}`,
        pass: false,
      };
    }
  },

})
