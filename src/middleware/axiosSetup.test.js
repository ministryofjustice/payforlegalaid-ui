import { axiosMiddleware } from "./axiosSetup";

describe('axiosSetup middleware',  () => {

    let req, res, next;

    beforeEach(() => {
        req = { get: jest.fn(), protocol: 'http' }
        res = {}
        next = jest.fn(); 
    });

    it('should call next() after setting up axios', () => {
        req.get.mockReturnValue('localhost');

        axiosMiddleware(req, res, next);

        expect(next).toHaveBeenCalled();
    })

})