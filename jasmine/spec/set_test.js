describe('set_test', function() {

	it('set() returns an empty set', function() {
		expect(new morpheus.Set().values()).toEqual([]);
	});

	it('size', function() {
		var s = new morpheus.Set();
		expect(s.size()).toEqual(0);
		s.add('foo');
		expect(s.size()).toEqual(1);
		s.add('foo');
		expect(s.size()).toEqual(1);
		s.add('bar');
		expect(s.size()).toEqual(2);
		s.remove('foo');
		expect(s.size()).toEqual(1);
		s.remove('foo');
		expect(s.size()).toEqual(1);
		s.remove('bar');
		expect(s.size()).toEqual(0);
	});
	it('forEach', function() {
		var s = new morpheus.Set();
		s.add('foo');
		s.add('bar');
		var c = [];
		s.forEach(function(v) {
			c.push(v);
		});
		c.sort();
		expect(c).toEqual([ 'bar', 'foo' ]);
	});

	it('add and remove', function() {
		var s = new morpheus.Set();
		s.add('foo');
		s.add('bar');
		expect(s.values().sort()).toEqual([ 'bar', 'foo' ]);
		s.remove('foo');
		expect(s.values().sort()).toEqual([ 'bar' ]);
		s.add('bar');
		expect(s.values().sort()).toEqual([ 'bar' ]);
		s.remove('bar');
		expect(s.values().sort()).toEqual([]);
		s.add('foo');
		expect(s.values().sort()).toEqual([ 'foo' ]);
	});

});
