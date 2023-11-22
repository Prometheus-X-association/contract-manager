// #swagger.start
/*
  #swagger.tags = ['Pap']
  #swagger.path = '/pap/policies/verify'
  #swagger.method = 'post'
  #swagger.produces = ['application/json']
  #swagger.summary = 'Endpoint to verify an ODRL policy.'
  #swagger.description = 'Endpoint to verify an ODRL policy.'
  #swagger.parameters['policy'] = {
    in: 'body',
    description: 'ODRL policy to be verified.',
    required: true,
    schema: { $ref: '#/definitions/ODRLPolicy' }
  }
  #swagger.responses[200] = {
    description: 'Policy verification result.',
    schema: { $ref: '#/definitions/VerificationResult' }
  }
  #swagger.responses[400] = {
    description: 'Bad request. The ODRL policy is not valid.',
    schema: { $ref: '#/definitions/Error' }
  }
  #swagger.responses[500] = {
    description: 'Internal server error.',
    schema: { $ref: '#/definitions/Error' }
  }
*/
// #swagger.end

// #swagger.start
/*
  #swagger.tags = ['Pap']
  #swagger.path = '/pap/policies/'
  #swagger.method = 'post'
  #swagger.produces = ['application/json']
  #swagger.summary = 'Endpoint to create a new policy.'
  #swagger.description = 'Endpoint to create a new policy.'
  #swagger.parameters['policy'] = {
    in: 'body',
    description: 'Policy object to be created.',
    required: true,
    schema: { $ref: '#/definitions/Policy' }
  }
  #swagger.responses[201] = {
    description: 'Policy created successfully.',
    schema: { $ref: '#/definitions/Policy' }
  }
  #swagger.responses[400] = {
    description: 'Bad request. Error creating the policy.',
    schema: { $ref: '#/definitions/Error' }
  }
*/
// #swagger.end

// #swagger.start
/*
  #swagger.tags = ['Pap']
  #swagger.path = '/pap/policies/{id}'
  #swagger.method = 'put'
  #swagger.produces = ['application/json']
  #swagger.summary = 'Endpoint to update a policy by ID.'
  #swagger.description = 'Endpoint to update a policy by ID.'
  #swagger.parameters['id'] = {
    in: 'path',
    description: 'ID of the policy.',
    required: true,
    type: 'string'
  }
  #swagger.parameters['policy'] = {
    in: 'body',
    description: 'Updated policy object.',
    required: true,
    schema: { $ref: '#/definitions/Policy' }
  }
  #swagger.responses[200] = {
    description: 'Policy updated successfully.',
    schema: { $ref: '#/definitions/Policy' }
  }
  #swagger.responses[400] = {
    description: 'Bad request. Error updating the policy.',
    schema: { $ref: '#/definitions/Error' }
  }
  #swagger.responses[404] = {
    description: 'Policy not found.',
    schema: { $ref: '#/definitions/Error' }
  }
  #swagger.responses[500] = {
    description: 'Internal server error.',
    schema: { $ref: '#/definitions/Error' }
  }
*/
// #swagger.end

// #swagger.start
/*
  #swagger.tags = ['Pap']
  #swagger.path = '/pap/policies/{id}'
  #swagger.method = 'delete'
  #swagger.produces = ['application/json']
  #swagger.summary = 'Endpoint to delete a policy by ID.'
  #swagger.description = 'Endpoint to delete a policy by ID.'
  #swagger.parameters['id'] = {
    in: 'path',
    description: 'ID of the policy.',
    required: true,
    type: 'string'
  }
  #swagger.responses[200] = {
    description: 'Policy deleted successfully.',
    schema: { $ref: '#/definitions/Policy' }
  }
  #swagger.responses[404] = {
    description: 'Policy not found.',
    schema: { $ref: '#/definitions/Error' }
  }
  #swagger.responses[500] = {
    description: 'Internal server error.',
    schema: { $ref: '#/definitions/Error' }
  }
*/
// #swagger.end

// #swagger.start
/*
  #swagger.tags = ['Pap']
  #swagger.path = '/pap/policies/'
  #swagger.method = 'get'
  #swagger.produces = ['application/json']
  #swagger.summary = 'Endpoint to get a list of policies.'
  #swagger.description = 'Endpoint to get a list of policies.'
  #swagger.responses[200] = {
    description: 'List of policies retrieved successfully.',
    schema: { $ref: '#/definitions/PolicyList' }
  }
  #swagger.responses[500] = {
    description: 'Internal server error.',
    schema: { $ref: '#/definitions/Error' }
  }
*/
// #swagger.end

// #swagger.start
/*
  #swagger.tags = ['Pap']
  #swagger.path = '/pap/policies/{id}'
  #swagger.method = 'get'
  #swagger.produces = ['application/json']
  #swagger.summary = 'Endpoint to get a policy by ID.'
  #swagger.description = 'Endpoint to get a policy by ID.'
  #swagger.parameters['id'] = {
    in: 'path',
    description: 'ID of the policy.',
    required: true,
    type: 'string'
  }
  #swagger.responses[200] = {
    description: 'Policy retrieved successfully.',
    schema: { $ref: '#/definitions/Policy' }
  }
  #swagger.responses[404] = {
    description: 'Policy not found.',
    schema: { $ref: '#/definitions/Error' }
  }
  #swagger.responses[500] = {
    description: 'Internal server error.',
    schema: { $ref: '#/definitions/Error' }
  }
*/
// #swagger.end

// #swagger.start
/*
  #swagger.tags = ['Pap']
  #swagger.path = '/pap/policies/{name}'
  #swagger.method = 'get'
  #swagger.produces = ['application/json']
  #swagger.summary = 'Endpoint to get policies by name.'
  #swagger.description = 'Endpoint to get policies by name.'
  #swagger.parameters['name'] = {
    in: 'path',
    description: 'Name of the policy.',
    required: true,
    type: 'string'
  }
  #swagger.responses[200] = {
    description: 'Policy retrieved successfully.',
    schema: { $ref: '#/definitions/Policy' }
  }
  #swagger.responses[404] = {
    description: 'No policies found with the given name.',
    schema: { $ref: '#/definitions/Error' }
  }
  #swagger.responses[500] = {
    description: 'Internal server error.',
    schema: { $ref: '#/definitions/Error' }
  }
*/
// #swagger.end
