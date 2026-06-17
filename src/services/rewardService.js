const axios = require('axios');
const { getAccessToken } = require('./authService');

async function createRewardDiscount(referrerEmail) {

  const token = await getAccessToken();

  const code =
    'REWARD-' +
    Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase();

  const response = await axios.post(
    `https://${process.env.SHOPIFY_STORE}/admin/api/${process.env.SHOPIFY_API_VERSION}/graphql.json`,
    {
      query: `
      mutation discountCodeBasicCreate(
        $basicCodeDiscount: DiscountCodeBasicInput!
      ) {
        discountCodeBasicCreate(
          basicCodeDiscount: $basicCodeDiscount
        ) {
          codeDiscountNode {
            id
          }
          userErrors {
            field
            message
          }
        }
      }
      `,
      variables: {
        basicCodeDiscount: {
          title: `Reward ${code}`,
          code: code,
          startsAt: new Date().toISOString(),
          customerGets: {
            value: {
              percentage: 0.15
            },
            items: {
              all: true
            }
          },
          customerSelection: {
            all: true
          }
        }
      }
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': token
      }
    }
  );

  console.log(
    'REWARD DISCOUNT CREATED'
  );

  return {
    code
  };

}

module.exports = {
  createRewardDiscount
};