// @ts-ignore
import nock from 'nock';

const baseURL = process.env.CATALOG_REGISTRY_URL || 'https://contract/static/references/rules';

export const ruleAccess1 = () => {
    nock(baseURL).get('/rule-access-1.json').reply(200, {
        "@context": {
            "xsd": "http://www.w3.org/2001/XMLSchema#",
            "description": {
                "@id": "https://schema.org/description",
                "@container": "@language"
            }
        },
        "@id": "http://localhost:3000/static/references/rules/rule-access-1.json",
        "title": {
            "@type": "xsd/string",
            "@value": "No Restriction"
        },
        "uid": "rule-access-1",
        "name": "No Restriction",
        "description": [
            {
                "@value": "CAN use data without any restrictions",
                "@language": "en"
            }
        ],
        "policy": {
            "permission": [
                {
                    "action": "use",
                    "target": "@{target}",
                    "constraint": []
                }
            ]
        },
        "requestedFields": [
            "target"
        ]
    }).persist();
};
export const ruleBilling1 = () => {
    nock(baseURL).get(`/rule-billing-1.json`).reply(200, {
        "@context": {
            "xsd": "http://www.w3.org/2001/XMLSchema#",
            "description": {
                "@id": "https://schema.org/description",
                "@container": "@language"
            }
        },
        "@id": "https://raw.githubusercontent.com/Prometheus-X-association/reference-models/main/src/references/rules/rule-billing-1.json",
        "title": {
            "@type": "xsd/string",
            "@value": "Verify Subscription Expiration"
        },
        "uid": "rule-billing-1",
        "name": "Verify Subscription Expiration",
        "description": [
            {
                "@value": "MUST verify that the current date is less than or equal to the subscription end date before granting usage permission.",
                "@language": "en"
            }
        ],
        "policy": {
            "permission": [
                {
                    "target": "@{target}",
                    "action": "use",
                    "duty": [
                        {
                            "action": "compensate",
                            "constraint": [
                                {
                                    "leftOperand": "subscriptionDateTime",
                                    "operator": "lteq",
                                    "rightOperand": "@{currentDateTime}"
                                }
                            ]
                        }
                    ]
                }
            ]
        },
        "requestedFields": [
            "target",
            "currentDateTime"
        ]
    });
};
export const ruleBilling2 = () => {
    nock(baseURL).get(`/rule-billing-2.json`).reply(200, {
        "@context": {
            "xsd": "http://www.w3.org/2001/XMLSchema#",
            "description": {
                "@id": "https://schema.org/description",
                "@container": "@language"
            }
        },
        "@id": "https://raw.githubusercontent.com/Prometheus-X-association/reference-models/main/src/references/rules/rule-billing-2.json",
        "title": {
            "@type": "xsd/string",
            "@value": "Compensation Payment"
        },
        "uid": "rule-billing-2",
        "name": "Compensation Payment",
        "description": [
            {
                "@value": "MUST have been compensated with the specified payment amount in EUR before granting usage permission.",
                "@language": "en"
            }
        ],
        "policy": {
            "permission": [
                {
                    "target": "@{target}",
                    "action": "use",
                    "duty": [
                        {
                            "action": "compensate",
                            "constraint": [
                                {
                                    "leftOperand": "payAmount",
                                    "operator": "eq",
                                    "rightOperand": "@{amount}",
                                    "unit": "EUR"
                                }
                            ]
                        }
                    ]
                }
            ]
        },
        "requestedFields": [
            "target",
            "amount"
        ]
    });
};
export const ruleBilling3 = () => {
    nock(baseURL).get(`/rule-billing-3.json`).reply(200, {
        "@context": {
            "xsd": "http://www.w3.org/2001/XMLSchema#",
            "description": {
                "@id": "https://schema.org/description",
                "@container": "@language"
            }
        },
        "@id": "https://raw.githubusercontent.com/Prometheus-X-association/reference-models/main/src/references/rules/rule-billing-3.json",
        "title": {
            "@type": "xsd/string",
            "@value": "Usage Count Subscription"
        },
        "uid": "rule-billing-3",
        "name": "Usage Count Subscription",
        "description": [
            {
                "@value": "MUST verify that the remaining usage count is greater than zero and decrement it before granting usage permission.",
                "@language": "en"
            }
        ],
        "policy": {
            "permission": [
                {
                    "target": "@{target}",
                    "action": "use",
                    "duty": [
                        {
                            "action": "extract",
                            "constraint": [
                                {
                                    "leftOperand": "usageCount",
                                    "operator": "gt",
                                    "rightOperand": 0
                                }
                            ]
                        }
                    ]
                }
            ]
        },
        "requestedFields": [
            "target"
        ]
    });
};
export const ruleBilling4 = () => {
    nock(baseURL).get(`/rule-billing-4.json`).reply(200, {
        "@context": {
            "xsd": "http://www.w3.org/2001/XMLSchema#",
            "description": {
                "@id": "https://schema.org/description",
                "@container": "@language"
            }
        },
        "@id": "https://raw.githubusercontent.com/Prometheus-X-association/reference-models/main/src/references/rules/rule-billing-4.json",
        "title": {
            "@type": "xsd/string",
            "@value": "Verify Subscription, Payment, or Usage"
        },
        "uid": "rule-billing-4",
        "name": "Verify Subscription, Payment, or Usage",
        "description": [
            {
                "@value": "MUST verify the subscription status and if expired, check if a payment has been made and if not, try to extract usage count before granting permission.",
                "@language": "en"
            }
        ],
        "policy": {
            "permission": [
                {
                    "target": "@{target}",
                    "action": "use",
                    "duty": [
                        {
                            "action": "compensate",
                            "constraint": [
                                {
                                    "leftOperand": "subscriptionDateTime",
                                    "operator": "lteq",
                                    "rightOperand": "@{currentDateTime}"
                                }
                            ],
                            "consequence": [
                                {
                                    "action": "compensate",
                                    "constraint": [
                                        {
                                            "leftOperand": "payAmount",
                                            "operator": "eq",
                                            "rightOperand": "@{amount}",
                                            "unit": "EUR"
                                        }
                                    ],
                                    "consequence": [
                                        {
                                            "action": "extract",
                                            "constraint": [
                                                {
                                                    "leftOperand": "usageCount",
                                                    "operator": "gt",
                                                    "rightOperand": 0
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        },
        "requestedFields": [
            "target",
            "currentDateTime",
            "amount"
        ]
    });
};
