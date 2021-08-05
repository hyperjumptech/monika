import { compileExpression as _compileExpression } from 'filtrex'
import { get as _get, has } from 'lodash'

export const compileExpression = (expression: string) => (obj: any) => {
  return _compileExpression(expression, {
    extraFunctions: {
      get: (path: string) => _get(obj, path),
      has: (obj: any, key: string) => {
        const val = has(obj, key)
        return val
      },
    },
  })(obj)
}
