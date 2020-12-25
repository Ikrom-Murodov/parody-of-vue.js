/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/indent */

import { ASTElement } from 'vue-template-compiler';
import { IHProps } from 'virtual-dom-library';
import getData from './utils';

/**
 * This function returns attributes from astElement.
 * @param {ASTElement} ast - compiled html text using compile function.
 * @param {[kye:string]:any} data - dynamic data.
 * @returns {IHProps}
 */
export default function getPropsFromAst(
  ast: ASTElement,
  data: { [key: string]: any },
): IHProps {
  const simpleAttrs: IHProps['simpleAttrs'] = {};
  const events: IHProps['events'] = {};
  let styles: IHProps['styles'] = {};
  let classes: IHProps['classes'] = [];

  if (ast.attrs) {
    ast.attrs.forEach((attr) => {
      const value = (attr.value as string).replace(/"/g, '');
      simpleAttrs[attr.name] = value;
    });
  }

  if (ast.events) {
    const keys = Object.keys(ast.events) as Array<
      keyof GlobalEventHandlersEventMap
    >;

    keys.forEach((eventName) => {
      const result = ast.events![eventName];

      if (!Array.isArray(result)) {
        const eventHandler = data[result.value];
        if (eventHandler) events[eventName] = eventHandler;
        else throw new Error(`Method: "${result.value}" was not found.`);
      }
    });
  }

  if (ast.styleBinding) {
    const result = getData(ast.styleBinding, data);
    if (!result) {
      throw new Error(`Styles "${ast.styleBinding}" were not found`);
    } else if (typeof result !== 'object') {
      throw new Error(`Styles can not be: ${typeof result}`);
    } else if (Array.isArray(result)) {
      throw new Error('Styles can not be Array');
    }
    styles = { ...styles, ...result };
  }

  if (ast.staticStyle) styles = { ...styles, ...JSON.parse(ast.staticStyle) };
  if (ast.staticClass) classes = ast.staticClass.replace(/"/g, '').split(' ');

  return {
    classes,
    events,
    simpleAttrs,
    styles,
  };
}
