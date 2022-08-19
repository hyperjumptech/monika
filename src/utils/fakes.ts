import { faker } from '@faker-js/faker'

export default {
  timestamp: (): string => Date.now().toString(),
  uuid: (): string => faker.datatype.uuid(),
}
