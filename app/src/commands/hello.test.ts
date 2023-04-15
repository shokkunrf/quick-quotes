import { hello } from '@/commands/hello';

test('basic', () => {
  expect(hello('world')).toBe('Hello world');
});
