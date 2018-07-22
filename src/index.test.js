import { Stuff } from './index';

describe('some test', function() {
  it('that is an test', async () => {
    const the_return = Stuff.doStuff();
    expect(the_return).toEqual('haha hello');
  });
});
