import {runtime} from '@pulumi/pulumi'

runtime.setMocks({
  newResource: function (args: runtime.MockResourceArgs): {
    id: string
    state: any
  } {
    return {
      id: args.inputs.name + '_id',
      state: args.inputs,
    }
  },
  call: function (args: runtime.MockCallArgs) {
    return args.inputs
  },
})
