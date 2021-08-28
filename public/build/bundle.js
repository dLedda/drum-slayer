
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
    function empty() {
        return text('');
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
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
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
        static count = 0;
        key;
        name;
        timeSigUp = 4;
        timeSigDown = 4;
        unitRecord = [];
        observers = [];
        barCount = 1;
        constructor(options) {
            this.key = `Beat-${Beat$1.count}`;
            if (options.timeSig) {
                this.name = options.name;
                this.setTimeSignature(options.timeSig.up, options.timeSig.down);
                this.setBars(options.bars);
            }
            else {
                this.name = this.key;
                this.setTimeSignature(4, 4);
                this.setBars(48);
            }
            Beat$1.count++;
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
            if (newBarCount < this.unitRecord.length) {
                this.unitRecord.splice(this.barCount * this.timeSigUp, this.unitRecord.length - newBarCount);
            }
            else if (newBarCount > this.unitRecord.length) {
                const barsToAdd = newBarCount - this.unitRecord.length;
                for (let i = 0; i < barsToAdd; i++) {
                    this.unitRecord.push(new BeatUnit$1());
                }
            }
        }
        getTimeSigUp() {
            return this.timeSigUp;
        }
        getTimeSigDown() {
            return this.timeSigDown;
        }
        turnUnitOn(index) {
            if (Math.abs(index | 0) !== index) {
                return;
            }
            const unit = this.getUnit(index);
            if (unit) {
                unit.setOn(true);
                this.notify();
            }
        }
        turnUnitOff(index) {
            if (Math.abs(index | 0) !== index) {
                return;
            }
            const unit = this.getUnit(index);
            if (unit) {
                unit.setOn(false);
                this.notify();
            }
        }
        toggleUnit(index) {
            if (Math.abs(index | 0) !== index) {
                return;
            }
            const unit = this.getUnit(index);
            if (unit) {
                unit.toggle();
                this.notify();
            }
        }
        setUnitType(index, type) {
            if (Math.abs(index | 0) !== index) {
                return;
            }
            this.getUnit(index).setType(type);
            this.notify();
        }
        unitIsOn(index) {
            return this.getUnit(index)?.isOn();
        }
        unitType(index) {
            return this.getUnit(index)?.getType();
        }
        onUpdate(updateCallback) {
            this.observers.push(updateCallback);
        }
        getUnit(index) {
            if (!this.unitRecord[index]) {
                throw new Error(`Invalid beat unit index! - ${index}`);
            }
            return this.unitRecord[index];
        }
        getBarCount() {
            return this.barCount;
        }
        getKey() {
            return this.key;
        }
        static isValidTimeSigRange(sig) {
            return sig >= 2 && sig <= 64;
        }
        notify() {
            this.observers.forEach(observer => observer());
        }
        setName(newName) {
            this.name = newName;
            this.notify();
        }
        getName() {
            return this.name;
        }
    }

    class Store {
        beats = [];
        beatKeyMap = {};
        subscribers = [];
        constructor(options) {
            for (const beatOptions of options.beats) {
                const newBeat = new Beat$1(beatOptions);
                this.beats.push(newBeat);
                this.beatKeyMap[newBeat.getKey()] = this.beats.length - 1;
            }
        }
        getBeatByKey(beatKey) {
            if (typeof this.beatKeyMap[beatKey] === "undefined") {
                throw new Error(`Could not find the beat with key: ${beatKey}`);
            }
            return this.getBeatByIndex(this.beatKeyMap[beatKey]);
        }
        getBeatByIndex(beatIndex) {
            if (!this.beats[beatIndex]) {
                throw new Error(`Could not find the beat with index: ${beatIndex}`);
            }
            return this.beats[beatIndex];
        }
        getBeatCount() {
            return this.beats.length;
        }
        getBeatKeys() {
            return this.beats.map(beat => beat.getKey());
        }
        swapBeatsByIndices(beatIndex1, beatIndex2) {
            const beat1 = this.getBeatByIndex(beatIndex1);
            const beat2 = this.getBeatByIndex(beatIndex2);
            this.beats[beatIndex1] = beat2;
            this.beats[beatIndex2] = beat1;
            this.beatKeyMap[beat1.getKey()] = beatIndex2;
            this.beatKeyMap[beat2.getKey()] = beatIndex1;
            this.notify();
        }
        swapBeatsByKeys(beatKey1, beatKey2) {
            const index1 = this.beatKeyMap[this.getBeatByKey(beatKey1).getKey()];
            const index2 = this.beatKeyMap[this.getBeatByKey(beatKey2).getKey()];
            this.swapBeatsByIndices(index1, index2);
        }
        notify() {
            this.subscribers.forEach(subscriber => subscriber());
        }
        onBeatChangeByKey(beatKey, subscriber) {
            this.getBeatByKey(beatKey).onUpdate(() => subscriber(beatKey));
        }
        onBeatChangeByIndex(beatIndex, subscriber) {
            this.getBeatByIndex(beatIndex).onUpdate(() => subscriber(beatIndex));
        }
        onBeatsChange(subscriber) {
            this.subscribers.push(subscriber);
        }
        moveBeatBack(beatKey) {
            const index = this.beatKeyMap[beatKey];
            if (typeof index !== "undefined" && index > 0) {
                this.swapBeatsByIndices(index, index - 1);
            }
            this.notify();
        }
        moveBeatForward(beatKey) {
            const index = this.beatKeyMap[beatKey];
            if (typeof index !== "undefined" && index < this.getBeatCount()) {
                this.swapBeatsByIndices(index, index + 1);
            }
            this.notify();
        }
        canMoveBeatBack(beatKey) {
            return this.beatKeyMap[beatKey] > 0;
        }
        canMoveBeatForward(beatKey) {
            return this.beatKeyMap[beatKey] < this.beats.length - 1;
        }
        setBeatName(beatKey, newName) {
            this.getBeatByKey(beatKey).setName(newName);
            this.notify();
        }
    }

    /* src/ui/BeatUnit.svelte generated by Svelte v3.42.1 */
    const file$3 = "src/ui/BeatUnit.svelte";

    function create_fragment$3(ctx) {
    	let div;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "unit svelte-1lue60t");
    			toggle_class(div, "ghost", /*ghost*/ ctx[1]);
    			toggle_class(div, "active", /*active*/ ctx[0]);
    			add_location(div, file$3, 17, 0, 441);
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
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let ghost;
    	let active;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('BeatUnit', slots, []);
    	let { index } = $$props;
    	let { beatKey } = $$props;
    	const store = getContext("store");
    	let beat = store.getBeatByKey(beatKey);

    	beat.onUpdate(() => {
    		$$invalidate(5, beat);
    	});

    	function onClick() {
    		beat.toggleUnit(index);
    	}

    	const writable_props = ['index', 'beatKey'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<BeatUnit> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('index' in $$props) $$invalidate(3, index = $$props.index);
    		if ('beatKey' in $$props) $$invalidate(4, beatKey = $$props.beatKey);
    	};

    	$$self.$capture_state = () => ({
    		BeatUnitType,
    		getContext,
    		Store,
    		index,
    		beatKey,
    		store,
    		beat,
    		onClick,
    		active,
    		ghost
    	});

    	$$self.$inject_state = $$props => {
    		if ('index' in $$props) $$invalidate(3, index = $$props.index);
    		if ('beatKey' in $$props) $$invalidate(4, beatKey = $$props.beatKey);
    		if ('beat' in $$props) $$invalidate(5, beat = $$props.beat);
    		if ('active' in $$props) $$invalidate(0, active = $$props.active);
    		if ('ghost' in $$props) $$invalidate(1, ghost = $$props.ghost);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*beat, index*/ 40) {
    			$$invalidate(1, ghost = beat.unitType(index) === BeatUnitType.GhostNote);
    		}

    		if ($$self.$$.dirty & /*beat, index*/ 40) {
    			$$invalidate(0, active = beat.unitIsOn(index));
    		}
    	};

    	return [active, ghost, onClick, index, beatKey, beat];
    }

    class BeatUnit extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { index: 3, beatKey: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "BeatUnit",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*index*/ ctx[3] === undefined && !('index' in props)) {
    			console.warn("<BeatUnit> was created without expected prop 'index'");
    		}

    		if (/*beatKey*/ ctx[4] === undefined && !('beatKey' in props)) {
    			console.warn("<BeatUnit> was created without expected prop 'beatKey'");
    		}
    	}

    	get index() {
    		throw new Error("<BeatUnit>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set index(value) {
    		throw new Error("<BeatUnit>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get beatKey() {
    		throw new Error("<BeatUnit>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set beatKey(value) {
    		throw new Error("<BeatUnit>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/ui/BeatOptions.svelte generated by Svelte v3.42.1 */
    const file$2 = "src/ui/BeatOptions.svelte";

    function create_fragment$2(ctx) {
    	let button0;
    	let t1;
    	let button1;
    	let t3;
    	let button2;
    	let t4;
    	let button2_disabled_value;
    	let t5;
    	let button3;
    	let t6;
    	let button3_disabled_value;
    	let t7;
    	let input0;
    	let input0_value_value;
    	let t8;
    	let h3;
    	let t10;
    	let input1;
    	let input1_value_value;
    	let t11;
    	let p;
    	let t13;
    	let input2;
    	let input2_value_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button0 = element("button");
    			button0.textContent = "Add Bar";
    			t1 = space();
    			button1 = element("button");
    			button1.textContent = "Remove Bar";
    			t3 = space();
    			button2 = element("button");
    			t4 = text("Back");
    			t5 = space();
    			button3 = element("button");
    			t6 = text("Forward");
    			t7 = space();
    			input0 = element("input");
    			t8 = space();
    			h3 = element("h3");
    			h3.textContent = "Time Sig";
    			t10 = space();
    			input1 = element("input");
    			t11 = space();
    			p = element("p");
    			p.textContent = "---";
    			t13 = space();
    			input2 = element("input");
    			add_location(button0, file$2, 43, 0, 1102);
    			add_location(button1, file$2, 44, 0, 1145);
    			button2.disabled = button2_disabled_value = !/*canMoveBack*/ ctx[1];
    			add_location(button2, file$2, 45, 0, 1194);
    			button3.disabled = button3_disabled_value = !/*canMoveForward*/ ctx[2];
    			add_location(button3, file$2, 46, 0, 1260);
    			attr_dev(input0, "type", "text");
    			input0.value = input0_value_value = /*beat*/ ctx[0].getName();
    			add_location(input0, file$2, 47, 0, 1335);
    			add_location(h3, file$2, 48, 0, 1408);
    			attr_dev(input1, "type", "text");
    			input1.value = input1_value_value = /*beat*/ ctx[0].getTimeSigUp();
    			add_location(input1, file$2, 49, 0, 1426);
    			add_location(p, file$2, 50, 0, 1509);
    			attr_dev(input2, "type", "text");
    			input2.value = input2_value_value = /*beat*/ ctx[0].getTimeSigDown();
    			add_location(input2, file$2, 51, 0, 1520);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, button1, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, button2, anchor);
    			append_dev(button2, t4);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, button3, anchor);
    			append_dev(button3, t6);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, input0, anchor);
    			insert_dev(target, t8, anchor);
    			insert_dev(target, h3, anchor);
    			insert_dev(target, t10, anchor);
    			insert_dev(target, input1, anchor);
    			insert_dev(target, t11, anchor);
    			insert_dev(target, p, anchor);
    			insert_dev(target, t13, anchor);
    			insert_dev(target, input2, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*addBar*/ ctx[3], false, false, false),
    					listen_dev(button1, "click", /*removeBar*/ ctx[4], false, false, false),
    					listen_dev(button2, "click", /*moveBack*/ ctx[7], false, false, false),
    					listen_dev(button3, "click", /*moveForward*/ ctx[8], false, false, false),
    					listen_dev(input0, "input", /*handleInputName*/ ctx[9], false, false, false),
    					listen_dev(input1, "input", /*handleInputTimeSigUp*/ ctx[5], false, false, false),
    					listen_dev(input2, "input", /*handleInputTimeSigDown*/ ctx[6], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*canMoveBack*/ 2 && button2_disabled_value !== (button2_disabled_value = !/*canMoveBack*/ ctx[1])) {
    				prop_dev(button2, "disabled", button2_disabled_value);
    			}

    			if (dirty & /*canMoveForward*/ 4 && button3_disabled_value !== (button3_disabled_value = !/*canMoveForward*/ ctx[2])) {
    				prop_dev(button3, "disabled", button3_disabled_value);
    			}

    			if (dirty & /*beat*/ 1 && input0_value_value !== (input0_value_value = /*beat*/ ctx[0].getName()) && input0.value !== input0_value_value) {
    				prop_dev(input0, "value", input0_value_value);
    			}

    			if (dirty & /*beat*/ 1 && input1_value_value !== (input1_value_value = /*beat*/ ctx[0].getTimeSigUp()) && input1.value !== input1_value_value) {
    				prop_dev(input1, "value", input1_value_value);
    			}

    			if (dirty & /*beat*/ 1 && input2_value_value !== (input2_value_value = /*beat*/ ctx[0].getTimeSigDown()) && input2.value !== input2_value_value) {
    				prop_dev(input2, "value", input2_value_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(button1);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(button2);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(button3);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(input0);
    			if (detaching) detach_dev(t8);
    			if (detaching) detach_dev(h3);
    			if (detaching) detach_dev(t10);
    			if (detaching) detach_dev(input1);
    			if (detaching) detach_dev(t11);
    			if (detaching) detach_dev(p);
    			if (detaching) detach_dev(t13);
    			if (detaching) detach_dev(input2);
    			mounted = false;
    			run_all(dispose);
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('BeatOptions', slots, []);
    	let { beatKey } = $$props;
    	let store = getContext('store');
    	let beat = store.getBeatByKey(beatKey);
    	let canMoveBack;
    	let canMoveForward;

    	function updatePositionLimits() {
    		$$invalidate(1, canMoveBack = store.canMoveBeatBack(beatKey));
    		$$invalidate(2, canMoveForward = store.canMoveBeatForward(beatKey));
    	}

    	updatePositionLimits();

    	store.onBeatsChange(() => {
    		updatePositionLimits();
    	});

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

    	function moveBack() {
    		store.moveBeatBack(beatKey);
    	}

    	function moveForward() {
    		store.moveBeatForward(beatKey);
    	}

    	function handleInputName(e) {
    		store.setBeatName(beatKey, e.target.value);
    	}

    	const writable_props = ['beatKey'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<BeatOptions> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('beatKey' in $$props) $$invalidate(10, beatKey = $$props.beatKey);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		Store,
    		beatKey,
    		store,
    		beat,
    		canMoveBack,
    		canMoveForward,
    		updatePositionLimits,
    		addBar,
    		removeBar,
    		handleInputTimeSigUp,
    		handleInputTimeSigDown,
    		moveBack,
    		moveForward,
    		handleInputName
    	});

    	$$self.$inject_state = $$props => {
    		if ('beatKey' in $$props) $$invalidate(10, beatKey = $$props.beatKey);
    		if ('store' in $$props) store = $$props.store;
    		if ('beat' in $$props) $$invalidate(0, beat = $$props.beat);
    		if ('canMoveBack' in $$props) $$invalidate(1, canMoveBack = $$props.canMoveBack);
    		if ('canMoveForward' in $$props) $$invalidate(2, canMoveForward = $$props.canMoveForward);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		beat,
    		canMoveBack,
    		canMoveForward,
    		addBar,
    		removeBar,
    		handleInputTimeSigUp,
    		handleInputTimeSigDown,
    		moveBack,
    		moveForward,
    		handleInputName,
    		beatKey
    	];
    }

    class BeatOptions extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { beatKey: 10 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "BeatOptions",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*beatKey*/ ctx[10] === undefined && !('beatKey' in props)) {
    			console.warn("<BeatOptions> was created without expected prop 'beatKey'");
    		}
    	}

    	get beatKey() {
    		throw new Error("<BeatOptions>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set beatKey(value) {
    		throw new Error("<BeatOptions>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/ui/Beat.svelte generated by Svelte v3.42.1 */
    const file$1 = "src/ui/Beat.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[9] = list[i];
    	child_ctx[11] = i;
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[9] = list[i];
    	child_ctx[13] = i;
    	return child_ctx;
    }

    // (28:16) {#each {length: timeSigUp} as _, noteIndex}
    function create_each_block_1(ctx) {
    	let div;
    	let beatunit;
    	let current;

    	beatunit = new BeatUnit({
    			props: {
    				beatKey: /*beatKey*/ ctx[1],
    				index: /*barIndex*/ ctx[11] * /*timeSigUp*/ ctx[5] + /*noteIndex*/ ctx[13]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(beatunit.$$.fragment);
    			attr_dev(div, "class", "unit svelte-ijae3p");
    			add_location(div, file$1, 28, 20, 987);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(beatunit, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const beatunit_changes = {};
    			if (dirty & /*beatKey*/ 2) beatunit_changes.beatKey = /*beatKey*/ ctx[1];
    			if (dirty & /*timeSigUp*/ 32) beatunit_changes.index = /*barIndex*/ ctx[11] * /*timeSigUp*/ ctx[5] + /*noteIndex*/ ctx[13];
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
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(28:16) {#each {length: timeSigUp} as _, noteIndex}",
    		ctx
    	});

    	return block;
    }

    // (26:8) {#each {length: barCount} as _, barIndex}
    function create_each_block$1(ctx) {
    	let div;
    	let t;
    	let current;
    	let each_value_1 = { length: /*timeSigUp*/ ctx[5] };
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

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			attr_dev(div, "class", "bar svelte-ijae3p");
    			add_location(div, file$1, 26, 12, 889);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			append_dev(div, t);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*beatKey, timeSigUp*/ 34) {
    				each_value_1 = { length: /*timeSigUp*/ ctx[5] };
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
    						each_blocks[i].m(div, t);
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
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(26:8) {#each {length: barCount} as _, barIndex}",
    		ctx
    	});

    	return block;
    }

    // (37:0) {#if showOptions}
    function create_if_block(ctx) {
    	let div;
    	let beatoptions;
    	let current;

    	beatoptions = new BeatOptions({
    			props: { beatKey: /*beatKey*/ ctx[1] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(beatoptions.$$.fragment);
    			attr_dev(div, "class", "options svelte-ijae3p");
    			add_location(div, file$1, 37, 4, 1231);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(beatoptions, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const beatoptions_changes = {};
    			if (dirty & /*beatKey*/ 2) beatoptions_changes.beatKey = /*beatKey*/ ctx[1];
    			beatoptions.$set(beatoptions_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(beatoptions.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(beatoptions.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(beatoptions);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(37:0) {#if showOptions}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div2;
    	let div1;
    	let h3;
    	let t0;
    	let t1;
    	let div0;
    	let t3;
    	let t4;
    	let if_block_anchor;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value = { length: /*barCount*/ ctx[4] };
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	let if_block = /*showOptions*/ ctx[0] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			h3 = element("h3");
    			t0 = text(/*beatName*/ ctx[6]);
    			t1 = space();
    			div0 = element("div");
    			div0.textContent = "?";
    			t3 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t4 = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			attr_dev(h3, "class", "svelte-ijae3p");
    			add_location(h3, file$1, 23, 8, 734);
    			attr_dev(div0, "class", "options-button svelte-ijae3p");
    			add_location(div0, file$1, 24, 8, 762);
    			attr_dev(div1, "class", "drum-line svelte-ijae3p");
    			add_location(div1, file$1, 22, 4, 702);
    			attr_dev(div2, "class", "lines svelte-ijae3p");
    			toggle_class(div2, "landscape", /*landscape*/ ctx[2]);
    			add_location(div2, file$1, 21, 0, 650);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, h3);
    			append_dev(h3, t0);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			append_dev(div1, t3);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			insert_dev(target, t4, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(
    					div0,
    					"click",
    					function () {
    						if (is_function(/*toggleOptionsView*/ ctx[3])) /*toggleOptionsView*/ ctx[3].apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				);

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;
    			if (!current || dirty & /*beatName*/ 64) set_data_dev(t0, /*beatName*/ ctx[6]);

    			if (dirty & /*timeSigUp, beatKey, barCount*/ 50) {
    				each_value = { length: /*barCount*/ ctx[4] };
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div1, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (dirty & /*landscape*/ 4) {
    				toggle_class(div2, "landscape", /*landscape*/ ctx[2]);
    			}

    			if (/*showOptions*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*showOptions*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t4);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    			mounted = false;
    			dispose();
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
    	let beatName;
    	let timeSigUp;
    	let barCount;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Beat', slots, []);
    	let { beatKey } = $$props;
    	let { landscape = true } = $$props;
    	let { showOptions = false } = $$props;

    	let { toggleOptionsView = () => {
    		$$invalidate(0, showOptions = !showOptions);
    	} } = $$props;

    	const store = getContext("store");
    	let beat = store.getBeatByKey(beatKey);

    	beat.onUpdate(() => {
    		$$invalidate(7, beat = store.getBeatByKey(beatKey));
    	});

    	store.onBeatsChange(() => {
    		$$invalidate(7, beat = store.getBeatByKey(beatKey));
    	});

    	const writable_props = ['beatKey', 'landscape', 'showOptions', 'toggleOptionsView'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Beat> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('beatKey' in $$props) $$invalidate(1, beatKey = $$props.beatKey);
    		if ('landscape' in $$props) $$invalidate(2, landscape = $$props.landscape);
    		if ('showOptions' in $$props) $$invalidate(0, showOptions = $$props.showOptions);
    		if ('toggleOptionsView' in $$props) $$invalidate(3, toggleOptionsView = $$props.toggleOptionsView);
    	};

    	$$self.$capture_state = () => ({
    		BeatUnit,
    		getContext,
    		Store,
    		BeatOptions,
    		beatKey,
    		landscape,
    		showOptions,
    		toggleOptionsView,
    		store,
    		beat,
    		barCount,
    		timeSigUp,
    		beatName
    	});

    	$$self.$inject_state = $$props => {
    		if ('beatKey' in $$props) $$invalidate(1, beatKey = $$props.beatKey);
    		if ('landscape' in $$props) $$invalidate(2, landscape = $$props.landscape);
    		if ('showOptions' in $$props) $$invalidate(0, showOptions = $$props.showOptions);
    		if ('toggleOptionsView' in $$props) $$invalidate(3, toggleOptionsView = $$props.toggleOptionsView);
    		if ('beat' in $$props) $$invalidate(7, beat = $$props.beat);
    		if ('barCount' in $$props) $$invalidate(4, barCount = $$props.barCount);
    		if ('timeSigUp' in $$props) $$invalidate(5, timeSigUp = $$props.timeSigUp);
    		if ('beatName' in $$props) $$invalidate(6, beatName = $$props.beatName);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*beat*/ 128) {
    			$$invalidate(6, beatName = beat.getName());
    		}

    		if ($$self.$$.dirty & /*beat*/ 128) {
    			$$invalidate(5, timeSigUp = beat.getTimeSigUp());
    		}

    		if ($$self.$$.dirty & /*beat*/ 128) {
    			$$invalidate(4, barCount = beat.getBarCount());
    		}
    	};

    	return [
    		showOptions,
    		beatKey,
    		landscape,
    		toggleOptionsView,
    		barCount,
    		timeSigUp,
    		beatName,
    		beat
    	];
    }

    class Beat extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {
    			beatKey: 1,
    			landscape: 2,
    			showOptions: 0,
    			toggleOptionsView: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Beat",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*beatKey*/ ctx[1] === undefined && !('beatKey' in props)) {
    			console.warn("<Beat> was created without expected prop 'beatKey'");
    		}
    	}

    	get beatKey() {
    		throw new Error("<Beat>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set beatKey(value) {
    		throw new Error("<Beat>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get landscape() {
    		throw new Error("<Beat>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set landscape(value) {
    		throw new Error("<Beat>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get showOptions() {
    		throw new Error("<Beat>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set showOptions(value) {
    		throw new Error("<Beat>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get toggleOptionsView() {
    		throw new Error("<Beat>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set toggleOptionsView(value) {
    		throw new Error("<Beat>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/ui/App.svelte generated by Svelte v3.42.1 */
    const file = "src/ui/App.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[7] = list[i];
    	return child_ctx;
    }

    // (32:4) {#each beatKeys as beatKey}
    function create_each_block(ctx) {
    	let beat;
    	let current;

    	function func() {
    		return /*func*/ ctx[6](/*beatKey*/ ctx[7]);
    	}

    	beat = new Beat({
    			props: {
    				toggleOptionsView: func,
    				showOptions: /*optionsOpen*/ ctx[2][/*beatKey*/ ctx[7]],
    				landscape: /*landscape*/ ctx[0],
    				beatKey: /*beatKey*/ ctx[7]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(beat.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(beat, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const beat_changes = {};
    			if (dirty & /*beatKeys*/ 2) beat_changes.toggleOptionsView = func;
    			if (dirty & /*optionsOpen, beatKeys*/ 6) beat_changes.showOptions = /*optionsOpen*/ ctx[2][/*beatKey*/ ctx[7]];
    			if (dirty & /*landscape*/ 1) beat_changes.landscape = /*landscape*/ ctx[0];
    			if (dirty & /*beatKeys*/ 2) beat_changes.beatKey = /*beatKey*/ ctx[7];
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
    			destroy_component(beat, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(32:4) {#each beatKeys as beatKey}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let h1;
    	let t1;
    	let div;
    	let button;
    	let t3;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value = /*beatKeys*/ ctx[1];
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
    			h1.textContent = "ArneDrums";
    			t1 = space();
    			div = element("div");
    			button = element("button");
    			button.textContent = "Toggle View";
    			t3 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(h1, "class", "svelte-pvij5y");
    			add_location(h1, file, 26, 0, 644);
    			add_location(button, file, 30, 4, 702);
    			attr_dev(div, "class", "main-contianer svelte-pvij5y");
    			add_location(div, file, 29, 0, 669);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div, anchor);
    			append_dev(div, button);
    			append_dev(div, t3);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*toggleOptionsView, beatKeys, optionsOpen, landscape*/ 15) {
    				each_value = /*beatKeys*/ ctx[1];
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
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			dispose();
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
    	let { landscape = true } = $$props;
    	setContext("store", store);
    	let beatKeys = store.getBeatKeys();
    	let optionsOpen = {};

    	store.onBeatsChange(() => {
    		$$invalidate(1, beatKeys = store.getBeatKeys());
    	});

    	function toggleOptionsView(beatKey) {
    		if (beatKey in optionsOpen) {
    			$$invalidate(2, optionsOpen[beatKey] = !optionsOpen[beatKey], optionsOpen);
    			($$invalidate(2, optionsOpen), $$invalidate(1, beatKeys));
    		}
    	}

    	const writable_props = ['store', 'landscape'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => $$invalidate(0, landscape = !landscape);
    	const func = beatKey => toggleOptionsView(beatKey);

    	$$self.$$set = $$props => {
    		if ('store' in $$props) $$invalidate(4, store = $$props.store);
    		if ('landscape' in $$props) $$invalidate(0, landscape = $$props.landscape);
    	};

    	$$self.$capture_state = () => ({
    		Store,
    		Beat,
    		setContext,
    		store,
    		landscape,
    		beatKeys,
    		optionsOpen,
    		toggleOptionsView
    	});

    	$$self.$inject_state = $$props => {
    		if ('store' in $$props) $$invalidate(4, store = $$props.store);
    		if ('landscape' in $$props) $$invalidate(0, landscape = $$props.landscape);
    		if ('beatKeys' in $$props) $$invalidate(1, beatKeys = $$props.beatKeys);
    		if ('optionsOpen' in $$props) $$invalidate(2, optionsOpen = $$props.optionsOpen);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*beatKeys, optionsOpen*/ 6) {
    			{
    				for (const beatKey of beatKeys) {
    					if (!(beatKey in optionsOpen)) {
    						$$invalidate(2, optionsOpen[beatKey] = false, optionsOpen);
    					}
    				}
    			}
    		}
    	};

    	return [
    		landscape,
    		beatKeys,
    		optionsOpen,
    		toggleOptionsView,
    		store,
    		click_handler,
    		func
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { store: 4, landscape: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*store*/ ctx[4] === undefined && !('store' in props)) {
    			console.warn("<App> was created without expected prop 'store'");
    		}
    	}

    	get store() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set store(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get landscape() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set landscape(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const defaultSettings = {
        bars: 10,
        timeSig: {
            down: 4,
            up: 4,
        },
    };
    const store = new Store({
        beats: [
            {
                name: "LF",
                ...defaultSettings,
            },
            {
                name: "LH",
                ...defaultSettings,
            },
            {
                name: "RH",
                ...defaultSettings,
            },
            {
                name: "RF",
                ...defaultSettings,
            }
        ]
    });
    const app = new App({
        target: document.body,
        props: { store },
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
