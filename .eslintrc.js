module.exports = {
    "extends": "airbnb",
    "plugins": [
        "react",
    ],
    "rules": {
        "indent": ["error", 4],
        'no-plusplus': ["error", { "allowForLoopAfterthoughts": true }],
        "func-names": ["error", "as-needed"],
    },
    "globals": {
        "mount": false,
    }
};
