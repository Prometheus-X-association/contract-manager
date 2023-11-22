// #swagger.start
/*
  #swagger.tags = ['User']
  #swagger.path = '/user/login'
  #swagger.method = 'get'
  #swagger.produces = ['application/json']
  #swagger.summary = 'Endpoint to log in a user.'
  #swagger.description = 'Endpoint to log in a user.'
  #swagger.parameters['user'] = {
    in: 'body',
    description: 'User object for login.',
    required: true,
    schema: { $ref: '#/components/schema/User' }
  }
  #swagger.responses[200] = {
    description: 'User logged in successfully.',
    schema: { $ref: '#/definitions/LoginResult' }
  }
  #swagger.responses[500] = {
    description: 'Internal server error.',
    schema: { $ref: '#/definitions/Error' }
  }
*/
// #swagger.end

// #swagger.start
/*
  #swagger.tags = ['User']
  #swagger.path = '/user/policies'
  #swagger.method = 'post'
  #swagger.produces = ['application/json']
  #swagger.summary = 'Endpoint to add policies to the user context.'
  #swagger.description = 'Endpoint to add policies to the user context.'
  #swagger.parameters['policies'] = {
    in: 'body',
    description: 'Array of policies to be added to the user context.',
    required: true,
    type: 'array',
    items: { $ref: '#/definitions/ODRLPolicy' }
  }
  #swagger.responses[200] = {
    description: 'New policies injected successfully.',
    schema: { $ref: '#/definitions/SuccessMessage' }
  }
  #swagger.responses[400] = {
    description: 'The following policies are not valid.',
    schema: { $ref: '#/definitions/InvalidPolicies' }
  }
  #swagger.responses[500] = {
    description: 'Internal server error.',
    schema: { $ref: '#/definitions/Error' }
  }
*/
// #swagger.end

// #swagger.start
/*
  #swagger.tags = ['User']
  #swagger.path = '/user/store'
  #swagger.method = 'put'
  #swagger.produces = ['application/json']
  #swagger.summary = 'Endpoint to store user data.'
  #swagger.description = 'Endpoint to store user data.'
  #swagger.responses[200] = {
    description: 'Data has been added to the store.',
    schema: { $ref: '#/definitions/SuccessMessage' }
  }
  #swagger.responses[500] = {
    description: 'Internal server error.',
    schema: { $ref: '#/definitions/Error' }
  }
*/
// #swagger.end
