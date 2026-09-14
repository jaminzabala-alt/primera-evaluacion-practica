module.exports = {
    testEnvironment: 'node',

     // Ignora node_modules y la carpeta de salida al buscar tests
    testPathIgnorePatterns: ['/node_modules/', '/coverage/'],
    
    //tiempo maximo de test
      testTimeout: 10000,
};
