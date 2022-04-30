import {isEven} from './math'

describe("isEven", () => {
    it('juft raqam berganda true qaytarishi',() =>{
        const result = isEven(2)
        expect(result).toEqual(true)
    })
    
    it('toq raqam berganda false qaytarishi', () => {
        const result = isEven(3)
        expect(result).toEqual(false)
    })
})
