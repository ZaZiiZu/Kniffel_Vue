import transfMatrices from '../../components/TransfMatrices.vue'
import {
  createLocalVue,
  shallow,
  mount
} from 'vue-test-utils'

describe('TransfMatrices_test', () => {
  it('testNumeroUno', () => {
    // Now mount the component and you have the wrapper
    const wrapper = mount(transfMatrices, {
      // propsData: { msg }
    })
    it('alternatives is a number', () => {
      expect(wrapper.vm.settings.alternatives)
        .toMatch(/[\d]/)
    })
    it('alternatives is >0', () => {
      expect(wrapper.vm.settings.alternatives)
        .toBeGreaterThen(0)
    })

    // it's also easy to check for the existence of elements
    // it('has a button', () => {
    //   expect(wrapper.contains('button')).toMatch(/[\d]/)
    // })

    // it('button should increment the count', () => {
    //   expect(wrapper.vm.count).toBe(0)
    //   const button = wrapper.find('button')
    //   button.trigger('click')
    //   expect(wrapper.vm.count).toBe(1)
    // })
  })
})
