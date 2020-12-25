/* eslint-disable no-param-reassign */
import { ASTElement, compile } from 'vue-template-compiler';
import { THChildren, IVNode, h } from 'virtual-dom-library';

/**
 * This function transforms the ast element into a virtual node.
 *
 * @example
 *  const html =
 *    `<div :style="styles.div" @click="clickHandler" class="container">
 *      <h1 data-type="h1" style="color: blue" :style="styles.h1">
 *        <span>{{ user.name }} - {{ user.surname }} - {{ user.age }}</span>
 *      </h1>
 *     </div>`;
 *
 *  const compileResult = compile(html, { whitespace: 'condense' });
 *
 *  const virtualNode = transformAstToVNode(element.ast as ASTElement, {
 *   user: { name: 'Ikrom', surname: 'Murodov', age: 19 },
 *  });
 *
 *
 * @param {ASTElement} ast - compiled html text using compile function.
 * @param {[kye:string]:any} data - dynamic data.
 * @returns {IVNode} Ast based virtual node.
 */
export default function transformAstToVNode(
  ast: ASTElement,
  data: { [key: string]: unknown },
): IVNode {
  const children: THChildren = [];

  function implementationTransformAstToVNode(
    // eslint-disable-next-line
    ast: ASTElement,
    parent: Array<IVNode | string>,
  ): void {
    ast.children.forEach((child) => {
      if (child.type === 1) {
        const parentForChild: THChildren = [];

        implementationTransformAstToVNode(child, parentForChild);
        parent.push(
          h(child.tag as keyof HTMLElementTagNameMap, null, parentForChild),
        );
      } else if (child.type === 2) {
        child.text = child.text.replace(
          /{{(.+?)}}/g,
          // eslint-disable-next-line
          (_: unknown, content: string) => eval(`data.${content.trim()}`),
        );
        parent.push(child.text);
      } else if (child.type === 3) parent.push(child.text);
    });
  }

  implementationTransformAstToVNode(ast, children);
  const virtualNode = h(ast.tag as keyof HTMLElementTagNameMap, null, children);
  return virtualNode;
}
