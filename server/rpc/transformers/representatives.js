const { rawToRai } = require("../../utils");

const representativesTransformer = json => {
  json.representatives = Object.entries(json.representatives).reduce(
    (acc = {}, [address, weight]) => {
      const formattedWeight = rawToRai(weight);

      // Filter accounts with less than 1 nano weight
      if (formattedWeight > 1) {
        acc[address] = formattedWeight;
      }
      return acc;
    },
    {}
  );

  return json;
};

exports.transformer = representativesTransformer;
