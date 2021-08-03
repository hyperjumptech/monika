import { compileExpression as _compileExpression } from 'filtrex'
import { get, merge } from 'lodash'

export const compileExpression: typeof _compileExpression = (
  expression,
  options
) => {
  return _compileExpression(
    expression,
    merge({ extraFunctions: { get } }, options)
  )
}
