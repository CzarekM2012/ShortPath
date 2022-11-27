/* Since both empty inputs and those with strings that are not considered
 * numbers, but can be written (such as "123-46.58") have value equal to '',
 * functions from "EnforceNumberInput" also have an effect of replacing improper
 * strings in inputs.*/
export namespace EnforceNumberInput {
  /*Limitations on range of values can be bypassed by writingthe value directly
   * into input.*/
  export function enforceRange(input: HTMLInputElement) {
    let value = Number(input.value);
    if (input.min != '' && value < Number(input.min)) {
      const min = Number(input.min);
      if (value < min) value = min;
    }
    if (input.max != '') {
      const max = Number(input.max);
      if (value > max) value = max;
    }
    input.value = value.toString();
  }

  export function enforceInteger(input: HTMLInputElement) {
    input.value = Math.trunc(Number(input.value)).toString();
  }
}

/* Minimum number of edges in graph with given number of nodes, required for
 * path between any pair of nodes to exist*/
export function minEdgesForConnectedGraph(nodes: number) {
  return nodes - 1;
}

/*Maximum number of edges in graph with given number of nodes. Graph with these
 * numbers of nodes and edges will be fully connected (every node will be
 * connected with every other node)*/
export function maxEdgesForConnectedGraph(nodes: number) {
  return nodes * (nodes - 1) / 2;
}
