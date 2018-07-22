import { ActionFirst } from '..';

describe('Action', () => {
  let mockAction;

  beforeEach(() => {
    let counter = 0;
    mockAction = new ActionFirst(({ resolve, reject, payload: { a } }) => {
      setTimeout(() => {
        counter += 1;
        resolve(a + counter);
      }, 1);
    });
  });

  it('simple call', async () => {
    const result = await mockAction.execute({ a: 0 });
    expect(result).toEqual(1);
  });

  it('multiple calls - should hang on ongoing Promise when equal payload', async () => {
    const promise1 = mockAction.execute({ a: 0 });
    const promise2 = mockAction.execute({ a: 0 });
    expect(promise1 === promise2).toBeTruthy();

    let testvalue1, testvalue2;
    promise1.then(result => (testvalue1 = result));
    promise2.then(result => (testvalue2 = result));
    await Promise.all([promise1, promise2]);
    expect(testvalue1).toEqual(1);
    expect(testvalue2).toEqual(1);
  });

  it('multiple calls - should execute concurrenlty when different paylaods', async () => {
    const promise1 = mockAction.execute({ a: 0 });
    const promise2 = mockAction.execute({ a: 1 });
    expect(promise1 !== promise2).toBeTruthy();

    let testvalue1, testvalue2;
    promise1.then(result => (testvalue1 = result));
    promise2.then(result => (testvalue2 = result));
    await Promise.all([promise1, promise2]);
    expect(testvalue1).toEqual(1);
    expect(testvalue2).toEqual(3);
  });

  it('should create new Promise after the previous resolved', async () => {
    const promise1 = mockAction.execute({ a: 5 });
    await promise1;
    const promise2 = mockAction.execute({ a: 5 });
    expect(promise1 !== promise2).toBeTruthy();
  });

  it('should reject on trhow', () => {
    const mockError = new Error('eeee');
    mockAction = new ActionFirst(({ resolve, reject }) => {
      throw mockError;
    });
    const promise1 = mockAction.execute({ a: 6 });
    expect(promise1).rejects.toBe(mockError);
  });
});
