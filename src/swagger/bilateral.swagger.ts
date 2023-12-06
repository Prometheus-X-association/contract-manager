// #swagger.start
/*
  #swagger.tags = ['Bilateral']
  #swagger.path = '/bilaterals/policies/{id}'
  #swagger.method = 'post'
  #swagger.summary = 'Inject multiple policies into a contract'
  #swagger.parameters['id'] = {
    in: 'path',
    description: 'ID of the contract',
    required: true,
    type: 'string'
  }
  #swagger.parameters['policies'] = {
    in: 'body',
    description: 'Array of policy data.',
    required: true,
    schema: {
      type: 'array',
      items: { $ref: '#/definitions/PolicyBilateralInjection' }
    }
  }
  #swagger.responses[200] = {
    description: 'Policies successfully injected',
    schema: { $ref: '#/definitions/Bilateral' }
  }
  #swagger.responses[400] = {
    description: 'Bad request, invalid data.',
    schema: { $ref: '#/definitions/Error' }
  }
  #swagger.responses[404] = {
    description: 'Contract not found.',
    schema: { $ref: '#/definitions/Error' }
  }
  #swagger.responses[500] = {
    description: 'Internal server error.',
    schema: { $ref: '#/definitions/Error' }
  }
*/
// #swagger.end
