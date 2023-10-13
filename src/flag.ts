import { Flags } from '@oclif/core'

export enum SYMON_API_VERSION {
  'v1',
  'v2',
}

export const symonAPIVersion = Flags.custom<SYMON_API_VERSION>({
  default: SYMON_API_VERSION.v1,
  options: ['v1', 'v2'],
  description:
    'Symon API version to use. Available options: v1, v2. Default: v1',
})
