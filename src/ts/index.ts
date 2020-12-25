/* eslint-disable @typescript-eslint/lines-between-class-members */
/* eslint-disable operator-linebreak */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
import { IVNode, patch, mount } from 'virtual-dom-library';
import { compile } from 'vue-template-compiler';
import reactive from 'proxy-handler-for-reactivity';
import transformAstToVNode from './transformAstToVNode';

type TAll =
  | string
  | number
  | boolean
  | Function
  | object
  | Symbol
  | BigInt
  | null
  | void;

interface IParamsVue<Data, TMethods, TComputed> {
  $el: string;
  template: string;
  data: Data;
  methods: TMethods;
  computed: TComputed;
}

interface IReactiveFunction {
  (...args: any[]): TAll;
}
// eslint-disable-next-line
export default class SimpleParodyOfVue<
  TData extends { [key: string]: any },
  TMethods extends {
    [key: string]: (
      this: TData & { [key: string]: any },
      event: Event,
      ...args: any[]
    ) => TAll;
  },
  TComputed extends {
    [key: string]: (
      this: TData & { [key: string]: any },
      ...args: any[]
    ) => TAll;
  }
> {
  private $el: HTMLElement;
  private template: string;
  private data: TData;
  private methods: TMethods;
  private $data: TData & TMethods & TComputed;
  private vNode: IVNode | null = null;
  private computed: TComputed;
  private activeEffect: boolean = false;
  private reactiveFunction: IReactiveFunction | null = null;
  private dependencyMap: Map<string, Array<IReactiveFunction>> = new Map();
  private optimizationData: { key: any; value: any } = {
    key: null,
    value: null,
  };

  constructor(params: IParamsVue<TData, TMethods, TComputed>) {
    const element = document.querySelector(params.$el) as HTMLElement | null;
    if (!element) throw new Error(`Incorrect selector: "${params.$el}"`);

    this.$el = element;
    this.template = params.template;
    this.methods = params.methods;
    this.computed = params.computed;

    this.data = reactive(params.data, {
      getHook: (target, key) => {
        if (typeof key === 'string') this.track(key);
      },

      setHook: (target, key, value) => {
        if (
          this.optimizationData.key === key &&
          this.optimizationData.value === value
        ) {
          return;
        }

        if (typeof key === 'string') {
          this.render();
          this.trigger(key);
        }

        this.optimizationData.key = key;
        this.optimizationData.value = value;
      },
    });

    this.$data = { ...this.methods, ...this.data, ...this.computed };

    this.init();
    this.render();
  }

  private init(): void {
    Object.keys(this.$data).forEach((data) => {
      if (typeof this.$data[data] === 'function') {
        // eslint-disable-next-line
        // @ts-ignore
        this.$data[data] = this.$data[data].bind(this.$data);
      }
    });

    Object.values(this.computed).forEach((value) => {
      this.watchEffect(value.bind(this.$data));
    });
  }

  private render(): void {
    const result = compile(this.template, { whitespace: 'condense' });
    if (!result || !result.ast) throw new Error('Invalid template.');

    const newVNode = transformAstToVNode(result.ast, this.$data);

    if (this.vNode) {
      patch(this.vNode, newVNode);
      this.vNode = newVNode;
    } else {
      this.vNode = newVNode;
      mount(newVNode, this.$el);
    }
  }

  private watchEffect(fn: IReactiveFunction): void {
    this.activeEffect = true;
    this.reactiveFunction = fn;
    fn();
    this.reactiveFunction = null;
    this.activeEffect = false;
  }

  private track(key: string): void {
    if (this.activeEffect && this.reactiveFunction) {
      if (this.dependencyMap.has(key)) {
        this.dependencyMap.get(key)?.push(this.reactiveFunction);
      } else {
        this.dependencyMap.set(key, [this.reactiveFunction]);
      }
    }
  }

  private trigger(key: string): void {
    if (this.dependencyMap.has(key)) {
      this.dependencyMap.get(key)?.forEach((dep) => dep());
    }
  }
}
