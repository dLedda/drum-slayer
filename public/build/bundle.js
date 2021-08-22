
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : options.context || []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.42.1' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    var BeatUnitType;
    (function (BeatUnitType) {
        BeatUnitType[BeatUnitType["Normal"] = 0] = "Normal";
        BeatUnitType[BeatUnitType["GhostNote"] = 1] = "GhostNote";
    })(BeatUnitType || (BeatUnitType = {}));
    class BeatUnit$1 {
        on = false;
        type = BeatUnitType.Normal;
        onUpdateCallbacks = [];
        constructor(on = false) {
            this.on = on;
        }
        stringify() {
            if (!this.on) {
                return "O";
            }
            if (this.type === BeatUnitType.GhostNote) {
                return "G";
            }
            else {
                return "#";
            }
        }
        toggle() {
            this.on = !this.on;
            this.notify();
        }
        setOn(on) {
            this.on = on;
            this.notify();
        }
        setType(type) {
            this.type = type;
            this.notify();
        }
        getType() {
            return this.type;
        }
        isOn() {
            return this.on;
        }
        onUpdate(callback) {
            this.onUpdateCallbacks.push(callback);
        }
        notify() {
            for (const cb of this.onUpdateCallbacks) {
                cb(this.on, this.type);
            }
        }
    }

    class Beat$1 {
        timeSigUp = 4;
        timeSigDown = 4;
        unitRecords;
        drumSchema;
        notify = () => { };
        barCount = 1;
        constructor(options) {
            this.unitRecords = {};
            if (options) {
                this.drumSchema = [...options.drumSchema];
                this.initUnitRecords();
                this.setTimeSignature(options.timeSig.up, options.timeSig.down);
                this.setBars(options.bars);
            }
            else {
                this.drumSchema = ['LF', 'LH', 'RH', 'RF'];
                this.initUnitRecords();
                this.setTimeSignature(4, 4);
                this.setBars(48);
            }
        }
        initUnitRecords() {
            for (const drumSchemaTag of this.drumSchema) {
                this.unitRecords[drumSchemaTag] = [];
            }
        }
        setTimeSignature(up, down) {
            if (Beat$1.isValidTimeSigRange(up)) {
                if (Beat$1.isValidTimeSigRange(down)) {
                    this.timeSigUp = up | 0;
                    this.timeSigDown = down | 0;
                    this.updateBeatUnitLength();
                    this.notify();
                }
            }
        }
        setBars(barCount) {
            const isPosInt = (barCount > 0 && (barCount | 0) === barCount);
            if (!isPosInt || barCount == this.barCount) {
                return;
            }
            this.barCount = barCount;
            this.updateBeatUnitLength();
            this.notify();
        }
        updateBeatUnitLength() {
            const newBarCount = this.barCount * this.timeSigUp;
            for (const drumSchemaTag of this.drumSchema) {
                const unitRecord = this.unitRecords[drumSchemaTag];
                if (newBarCount < unitRecord.length) {
                    unitRecord.splice(this.barCount, unitRecord.length - newBarCount);
                }
                else if (newBarCount > unitRecord.length) {
                    const barsToAdd = newBarCount - unitRecord.length;
                    for (let i = 0; i < barsToAdd; i++) {
                        unitRecord.push(new BeatUnit$1());
                    }
                }
            }
        }
        getTimeSigUp() {
            return this.timeSigUp;
        }
        getTimeSigDown() {
            return this.timeSigDown;
        }
        stringify() {
            let stringified = this.drumSchema.join(" ");
            stringified += "\n";
            for (let i = 0; i < this.unitRecords[this.drumSchema[0]].length; i++) {
                for (const drumSchemaTag of this.drumSchema) {
                    stringified += this.unitRecords[drumSchemaTag][i].stringify() + " ";
                }
                if (i % this.timeSigUp === 2) {
                    stringified += "\n";
                }
                stringified += "\n";
            }
            return stringified;
        }
        swapSchemaOrder(index1, index2) {
            if (this.drumSchema[index1] && this.drumSchema[index2]) {
                const temp = this.drumSchema[index1];
                this.drumSchema[index1] = this.drumSchema[index2];
                this.drumSchema[index2] = temp;
            }
            this.notify();
        }
        turnUnitOn(schemaKey, index) {
            if (Math.abs(index | 0) !== index) {
                return;
            }
            if (this.unitRecords[schemaKey] && this.unitRecords[schemaKey][index]) {
                this.unitRecords[schemaKey][index].setOn(true);
            }
        }
        turnUnitOff(schemaKey, index) {
            if (Math.abs(index | 0) !== index) {
                return;
            }
            if (this.unitRecords[schemaKey] && this.unitRecords[schemaKey][index]) {
                this.unitRecords[schemaKey][index].setOn(false);
            }
        }
        toggleUnit(schemaKey, index) {
            if (Math.abs(index | 0) !== index) {
                return;
            }
            if (this.unitRecords[schemaKey] && this.unitRecords[schemaKey][index]) {
                this.unitRecords[schemaKey][index].toggle();
            }
        }
        setUnitType(schemaKey, index, type) {
            if (Math.abs(index | 0) !== index) {
                return;
            }
            this.unitRecords[schemaKey]?.[index]?.setType(type);
        }
        onUpdate(updateCallback) {
            this.notify = updateCallback;
        }
        getUnit(schemaKey, index) {
            return this.unitRecords[schemaKey]?.[index] ?? null;
        }
        getDrumSchema() {
            return this.drumSchema.slice();
        }
        getBarCount() {
            return this.barCount;
        }
        static isValidTimeSigRange(sig) {
            return sig >= 2 && sig <= 64;
        }
    }

    class Store {
        beat;
        constructor(options) {
            this.beat = new Beat$1(options);
        }
        getBeat() {
            return this.beat;
        }
        subscribeBeatUnit(schemaKey, index, callback) {
            this.beat.onUnitUpdate(() => {
                callback(this.beat.getUnit(schemaKey, index));
            });
            return this.beat.getUnit(schemaKey, index);
        }
    }

    /* src\ui\BeatUnit.svelte generated by Svelte v3.42.1 */
    const file$2 = "src\\ui\\BeatUnit.svelte";

    function create_fragment$2(ctx) {
    	let div;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "unit svelte-1lue60t");
    			toggle_class(div, "ghost", /*ghost*/ ctx[1]);
    			toggle_class(div, "active", /*active*/ ctx[0]);
    			add_location(div, file$2, 13, 0, 269);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*onClick*/ ctx[2], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*ghost*/ 2) {
    				toggle_class(div, "ghost", /*ghost*/ ctx[1]);
    			}

    			if (dirty & /*active*/ 1) {
    				toggle_class(div, "active", /*active*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let ghost;
    	let active;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('BeatUnit', slots, []);
    	
    	let { unit } = $$props;

    	unit.onUpdate(() => {
    		$$invalidate(3, unit);
    	});

    	function onClick() {
    		unit.toggle();
    	}

    	const writable_props = ['unit'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<BeatUnit> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('unit' in $$props) $$invalidate(3, unit = $$props.unit);
    	};

    	$$self.$capture_state = () => ({
    		BeatUnitType,
    		unit,
    		onClick,
    		active,
    		ghost
    	});

    	$$self.$inject_state = $$props => {
    		if ('unit' in $$props) $$invalidate(3, unit = $$props.unit);
    		if ('active' in $$props) $$invalidate(0, active = $$props.active);
    		if ('ghost' in $$props) $$invalidate(1, ghost = $$props.ghost);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*unit*/ 8) {
    			$$invalidate(1, ghost = unit.getType() === BeatUnitType.GhostNote);
    		}

    		if ($$self.$$.dirty & /*unit*/ 8) {
    			$$invalidate(0, active = unit.isOn());
    		}
    	};

    	return [active, ghost, onClick, unit];
    }

    class BeatUnit extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { unit: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "BeatUnit",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*unit*/ ctx[3] === undefined && !('unit' in props)) {
    			console.warn("<BeatUnit> was created without expected prop 'unit'");
    		}
    	}

    	get unit() {
    		throw new Error("<BeatUnit>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set unit(value) {
    		throw new Error("<BeatUnit>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\ui\Beat.svelte generated by Svelte v3.42.1 */
    const file$1 = "src\\ui\\Beat.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[10] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[13] = list[i];
    	child_ctx[15] = i;
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[13] = list[i];
    	child_ctx[17] = i;
    	return child_ctx;
    }

    // (43:20) {#each {length: timeSigUp} as _, noteIndex}
    function create_each_block_2(ctx) {
    	let div;
    	let beatunit;
    	let current;

    	beatunit = new BeatUnit({
    			props: {
    				unit: /*beat*/ ctx[0].getUnit(/*drumSchemaKey*/ ctx[10], /*timeSigUp*/ ctx[4] * /*barIndex*/ ctx[15] + /*noteIndex*/ ctx[17])
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(beatunit.$$.fragment);
    			attr_dev(div, "class", "unit svelte-1f51h8v");
    			add_location(div, file$1, 43, 24, 1429);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(beatunit, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const beatunit_changes = {};
    			if (dirty & /*beat, drumSchema, timeSigUp*/ 21) beatunit_changes.unit = /*beat*/ ctx[0].getUnit(/*drumSchemaKey*/ ctx[10], /*timeSigUp*/ ctx[4] * /*barIndex*/ ctx[15] + /*noteIndex*/ ctx[17]);
    			beatunit.$set(beatunit_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(beatunit.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(beatunit.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(beatunit);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(43:20) {#each {length: timeSigUp} as _, noteIndex}",
    		ctx
    	});

    	return block;
    }

    // (41:12) {#each {length: barCount} as _, barIndex}
    function create_each_block_1(ctx) {
    	let div;
    	let current;
    	let each_value_2 = { length: /*timeSigUp*/ ctx[4] };
    	validate_each_argument(each_value_2);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "bar svelte-1f51h8v");
    			add_location(div, file$1, 41, 16, 1321);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*beat, drumSchema, timeSigUp*/ 21) {
    				each_value_2 = { length: /*timeSigUp*/ ctx[4] };
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block_2(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();

    				for (i = each_value_2.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_2.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(41:12) {#each {length: barCount} as _, barIndex}",
    		ctx
    	});

    	return block;
    }

    // (38:4) {#each drumSchema as drumSchemaKey}
    function create_each_block(ctx) {
    	let div;
    	let h3;
    	let t0_value = /*drumSchemaKey*/ ctx[10] + "";
    	let t0;
    	let t1;
    	let t2;
    	let current;
    	let each_value_1 = { length: /*barCount*/ ctx[3] };
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div = element("div");
    			h3 = element("h3");
    			t0 = text(t0_value);
    			t1 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t2 = space();
    			attr_dev(h3, "class", "svelte-1f51h8v");
    			add_location(h3, file$1, 39, 12, 1224);
    			attr_dev(div, "class", "drum-line svelte-1f51h8v");
    			add_location(div, file$1, 38, 8, 1187);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h3);
    			append_dev(h3, t0);
    			append_dev(div, t1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			append_dev(div, t2);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty & /*drumSchema*/ 4) && t0_value !== (t0_value = /*drumSchemaKey*/ ctx[10] + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*timeSigUp, beat, drumSchema, barCount*/ 29) {
    				each_value_1 = { length: /*barCount*/ ctx[3] };
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, t2);
    					}
    				}

    				group_outros();

    				for (i = each_value_1.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(38:4) {#each drumSchema as drumSchemaKey}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let h1;
    	let t1;
    	let button0;
    	let t3;
    	let button1;
    	let t5;
    	let button2;
    	let t7;
    	let h3;
    	let t9;
    	let input0;
    	let input0_value_value;
    	let t10;
    	let p;
    	let t12;
    	let input1;
    	let input1_value_value;
    	let t13;
    	let div;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value = /*drumSchema*/ ctx[2];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "Beat";
    			t1 = space();
    			button0 = element("button");
    			button0.textContent = "Add Bar";
    			t3 = space();
    			button1 = element("button");
    			button1.textContent = "Remove Bar";
    			t5 = space();
    			button2 = element("button");
    			button2.textContent = "Toggle View";
    			t7 = space();
    			h3 = element("h3");
    			h3.textContent = "Time Sig";
    			t9 = space();
    			input0 = element("input");
    			t10 = space();
    			p = element("p");
    			p.textContent = "---";
    			t12 = space();
    			input1 = element("input");
    			t13 = space();
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(h1, "class", "svelte-1f51h8v");
    			add_location(h1, file$1, 26, 0, 703);
    			add_location(button0, file$1, 28, 0, 720);
    			add_location(button1, file$1, 29, 0, 764);
    			add_location(button2, file$1, 30, 0, 814);
    			add_location(h3, file$1, 31, 0, 884);
    			attr_dev(input0, "type", "text");
    			input0.value = input0_value_value = /*beat*/ ctx[0].getTimeSigUp();
    			add_location(input0, file$1, 32, 0, 903);
    			add_location(p, file$1, 33, 0, 987);
    			attr_dev(input1, "type", "text");
    			input1.value = input1_value_value = /*beat*/ ctx[0].getTimeSigDown();
    			add_location(input1, file$1, 34, 0, 999);
    			attr_dev(div, "class", "lines svelte-1f51h8v");
    			toggle_class(div, "landscape", /*landscape*/ ctx[1]);
    			add_location(div, file$1, 36, 0, 1089);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, button0, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, button1, anchor);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, button2, anchor);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, h3, anchor);
    			insert_dev(target, t9, anchor);
    			insert_dev(target, input0, anchor);
    			insert_dev(target, t10, anchor);
    			insert_dev(target, p, anchor);
    			insert_dev(target, t12, anchor);
    			insert_dev(target, input1, anchor);
    			insert_dev(target, t13, anchor);
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*addBar*/ ctx[5], false, false, false),
    					listen_dev(button1, "click", /*removeBar*/ ctx[6], false, false, false),
    					listen_dev(button2, "click", /*click_handler*/ ctx[9], false, false, false),
    					listen_dev(input0, "input", /*handleInputTimeSigUp*/ ctx[7], false, false, false),
    					listen_dev(input1, "input", /*handleInputTimeSigDown*/ ctx[8], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*beat*/ 1 && input0_value_value !== (input0_value_value = /*beat*/ ctx[0].getTimeSigUp()) && input0.value !== input0_value_value) {
    				prop_dev(input0, "value", input0_value_value);
    			}

    			if (!current || dirty & /*beat*/ 1 && input1_value_value !== (input1_value_value = /*beat*/ ctx[0].getTimeSigDown()) && input1.value !== input1_value_value) {
    				prop_dev(input1, "value", input1_value_value);
    			}

    			if (dirty & /*barCount, timeSigUp, beat, drumSchema*/ 29) {
    				each_value = /*drumSchema*/ ctx[2];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (dirty & /*landscape*/ 2) {
    				toggle_class(div, "landscape", /*landscape*/ ctx[1]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(button0);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(button1);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(button2);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(h3);
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(input0);
    			if (detaching) detach_dev(t10);
    			if (detaching) detach_dev(p);
    			if (detaching) detach_dev(t12);
    			if (detaching) detach_dev(input1);
    			if (detaching) detach_dev(t13);
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let timeSigUp;
    	let barCount;
    	let drumSchema;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Beat', slots, []);
    	
    	let { beat } = $$props;
    	let { landscape = true } = $$props;

    	beat.onUpdate(() => {
    		$$invalidate(0, beat);
    	});

    	function addBar() {
    		beat.setBars(beat.getBarCount() + 1);
    	}

    	function removeBar() {
    		beat.setBars(beat.getBarCount() - 1);
    	}

    	function handleInputTimeSigUp(e) {
    		const sigUp = Number(e.target.value);
    		beat.setTimeSignature(sigUp, beat.getTimeSigDown());
    	}

    	function handleInputTimeSigDown(e) {
    		const sigDown = Number(e.target.value);
    		beat.setTimeSignature(beat.getTimeSigUp(), sigDown);
    	}

    	const writable_props = ['beat', 'landscape'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Beat> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => $$invalidate(1, landscape = !landscape);

    	$$self.$$set = $$props => {
    		if ('beat' in $$props) $$invalidate(0, beat = $$props.beat);
    		if ('landscape' in $$props) $$invalidate(1, landscape = $$props.landscape);
    	};

    	$$self.$capture_state = () => ({
    		BeatUnit,
    		beat,
    		landscape,
    		addBar,
    		removeBar,
    		handleInputTimeSigUp,
    		handleInputTimeSigDown,
    		drumSchema,
    		barCount,
    		timeSigUp
    	});

    	$$self.$inject_state = $$props => {
    		if ('beat' in $$props) $$invalidate(0, beat = $$props.beat);
    		if ('landscape' in $$props) $$invalidate(1, landscape = $$props.landscape);
    		if ('drumSchema' in $$props) $$invalidate(2, drumSchema = $$props.drumSchema);
    		if ('barCount' in $$props) $$invalidate(3, barCount = $$props.barCount);
    		if ('timeSigUp' in $$props) $$invalidate(4, timeSigUp = $$props.timeSigUp);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*beat*/ 1) {
    			$$invalidate(4, timeSigUp = beat.getTimeSigUp());
    		}

    		if ($$self.$$.dirty & /*beat*/ 1) {
    			$$invalidate(3, barCount = beat.getBarCount());
    		}

    		if ($$self.$$.dirty & /*beat*/ 1) {
    			$$invalidate(2, drumSchema = beat.getDrumSchema());
    		}
    	};

    	return [
    		beat,
    		landscape,
    		drumSchema,
    		barCount,
    		timeSigUp,
    		addBar,
    		removeBar,
    		handleInputTimeSigUp,
    		handleInputTimeSigDown,
    		click_handler
    	];
    }

    class Beat extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { beat: 0, landscape: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Beat",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*beat*/ ctx[0] === undefined && !('beat' in props)) {
    			console.warn("<Beat> was created without expected prop 'beat'");
    		}
    	}

    	get beat() {
    		throw new Error("<Beat>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set beat(value) {
    		throw new Error("<Beat>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get landscape() {
    		throw new Error("<Beat>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set landscape(value) {
    		throw new Error("<Beat>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\ui\App.svelte generated by Svelte v3.42.1 */
    const file = "src\\ui\\App.svelte";

    function create_fragment(ctx) {
    	let h1;
    	let t1;
    	let div;
    	let beat;
    	let current;

    	beat = new Beat({
    			props: { beat: /*store*/ ctx[0].getBeat() },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "ArneDrums";
    			t1 = space();
    			div = element("div");
    			create_component(beat.$$.fragment);
    			attr_dev(h1, "class", "svelte-pvij5y");
    			add_location(h1, file, 5, 0, 116);
    			attr_dev(div, "class", "main-contianer svelte-pvij5y");
    			add_location(div, file, 8, 0, 144);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div, anchor);
    			mount_component(beat, div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const beat_changes = {};
    			if (dirty & /*store*/ 1) beat_changes.beat = /*store*/ ctx[0].getBeat();
    			beat.$set(beat_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(beat.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(beat.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div);
    			destroy_component(beat);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let { store } = $$props;
    	const writable_props = ['store'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('store' in $$props) $$invalidate(0, store = $$props.store);
    	};

    	$$self.$capture_state = () => ({ Store, Beat, store });

    	$$self.$inject_state = $$props => {
    		if ('store' in $$props) $$invalidate(0, store = $$props.store);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [store];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { store: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*store*/ ctx[0] === undefined && !('store' in props)) {
    			console.warn("<App> was created without expected prop 'store'");
    		}
    	}

    	get store() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set store(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const app = new App({
        target: document.body,
        props: {
            store: new Store({
                bars: 10,
                timeSig: {
                    down: 4,
                    up: 4,
                },
                drumSchema: ['LF', 'LH', 'RH', 'RF'],
            }),
        },
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
