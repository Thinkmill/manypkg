import { getPackages } from "./";

describe("get-packages", () => {
  it('should throw an error when "dir" is not provided', () => {
    expect(getPackages()).toThrowError("Dir path must be provided");
  });
});
