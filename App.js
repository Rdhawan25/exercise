import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Modal, TextInput, Button, PanResponder, Animated } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

const ProductListScreen = ({ navigation }) => {
  const [products, setProducts] = useState([
    {
      id: 1,
      name: 'Product 1',
      category: 'Category 1',
      price: 10.99,
      description: 'This is the description or Product 1',
    },
    {
      id: 2,
      name: 'Product 2',
      category: 'Category 2',
      price: 19.99,
      description: 'This is the description or Product 2',
    },
    {
      id: 3,
      name: 'Product 3',
      category: 'Category 1',
      price: 14.99,
      description: 'This is the description or Product 3',
    },
    {
      id: 4,
      name: 'Product 4',
      category: 'Category 2',
      price: 7.99,
      description: 'This is the description or Product 4',
    },
    {
      id: 5,
      name: 'Product 5',
      category: 'Category 1',
      price: 12.99,
      description: 'This is the description or Product 5',
    },
  ]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newProduct, setNewProduct] = useState({
    id: '',
    name: '',
    category: '',
    price: '',
    description: '',
  });
  const [sortOption, setSortOption] = useState(null);

  const handleAddProduct = () => {
    setProducts([...products, newProduct]);
    setModalVisible(false);
    setNewProduct({
      id: '',
      name: '',
      category: '',
      price: '',
      description: '',
    });
  };

  const handleDeleteProduct = (id) => {
    const updatedProducts = products.filter((product) => product.id !== id);
    setProducts(updatedProducts);
  };

  const handleSort = (option) => {
    let sortedProducts = [];
    if (option === 'id') {
      sortedProducts = [...products].sort((a, b) => a.id - b.id);
    } else if (option === 'price') {
      sortedProducts = [...products].sort((a, b) => a.price - b.price);
    }
    setSortOption(option);
    setProducts(sortedProducts);
  };

  const renderProductItem = ({ item }) => {
    let swipeAnimatedValue = new Animated.Value(0);
    let rowSwipeAnimatedStyles = {
      transform: [{ translateX: swipeAnimatedValue }],
    };

    const panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        swipeAnimatedValue.setValue(gestureState.dx);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < -100) {
          handleDeleteProduct(item.id);
        } else {
          Animated.spring(swipeAnimatedValue, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    });

    return (
      <Animated.View style={[styles.container, rowSwipeAnimatedStyles]}>
        <TouchableOpacity
          style={styles.contentContainer}
          onPress={() =>
            navigation.navigate('ProductDetails', {
              product: item,
              products: products,
              setProducts: setProducts,
              currentIndex: products.findIndex((p) => p.id === item.id),
            })
          }
          {...panResponder.panHandlers}
        >
          <Text style={styles.title}>{item.name}</Text>
          <Text>Category: {item.category}</Text>
          <Text>Price: ${item.price}</Text>
          <Text>Description: {item.description}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteProduct(item.id)}
        >
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };


  return (
    <View style={styles.container}>
      <View style={styles.sortContainer}>
        <TouchableOpacity
          style={[styles.sortButton, sortOption === 'id' && styles.activeSortButton]}
          onPress={() => handleSort('id')}
        >
          <Text style={[styles.sortButtonText, sortOption === 'id' && styles.activeSortButtonText]}>Sort by ID</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sortButton, sortOption === 'price' && styles.activeSortButton]}
          onPress={() => handleSort('price')}
        >
          <Text style={[styles.sortButtonText, sortOption === 'price' && styles.activeSortButtonText]}>Sort by Price</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={products}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderProductItem}
      />

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.addButtonText}>Add Product</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Add Product</Text>

          <TextInput
            style={styles.input}
            placeholder="Product ID"
            value={newProduct.id}
            onChangeText={(text) => setNewProduct({ ...newProduct, id: text })}
          />

          <TextInput
            style={styles.input}
            placeholder="Product Name"
            value={newProduct.name}
            onChangeText={(text) => setNewProduct({ ...newProduct, name: text })}
          />

          <TextInput
            style={styles.input}
            placeholder="Product Category"
            value={newProduct.category}
            onChangeText={(text) => setNewProduct({ ...newProduct, category: text })}
          />

          <TextInput
            style={styles.input}
            placeholder="Product Price"
            value={newProduct.price}
            onChangeText={(text) => setNewProduct({ ...newProduct, price: text })}
          />

          <TextInput
            style={styles.input}
            placeholder="Product Description"
            value={newProduct.description}
            onChangeText={(text) => setNewProduct({ ...newProduct, description: text })}
          />

          <Button title="Add" onPress={handleAddProduct} />
          <Button title="Cancel" onPress={() => setModalVisible(false)} />
        </View>
      </Modal>
    </View>
  );
};

const ProductDetailsScreen = ({ route, navigation }) => {
  const { product, products, setProducts, currentIndex } = route.params;
  const [editMode, setEditMode] = useState(false);
  const [editedProduct, setEditedProduct] = useState(product);

  const handleEditProduct = () => {
    const updatedProducts = products.map((p) =>
      p.id === editedProduct.id ? editedProduct : p
    );
    setProducts(updatedProducts);
    setEditMode(false);
  };

  const handleNext = () => {
    const nextIndex = currentIndex + 1;
    if (nextIndex < products.length) {
      navigation.setParams({
        currentIndex: nextIndex,
        product: products[nextIndex],
      });
      setEditedProduct(products[nextIndex]);
    }
  };

  const handlePrevious = () => {
    const previousIndex = currentIndex - 1;
    if (previousIndex >= 0) {
      navigation.setParams({
        currentIndex: previousIndex,
        product: products[previousIndex],
      });
      setEditedProduct(products[previousIndex]);
    }
  };

  const handleFirst = () => {
    navigation.setParams({
      currentIndex: 0,
      product: products[0],
    });
    setEditedProduct(products[0]);
  };

  const handleLast = () => {
    const lastIndex = products.length - 1;
    navigation.setParams({
      currentIndex: lastIndex,
      product: products[lastIndex],
    });
    setEditedProduct(products[lastIndex]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.cardContainer}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{editedProduct.name}</Text>
          <Text>Category: {editedProduct.category}</Text>
          <Text>Price: ${editedProduct.price}</Text>
          <Text>Description: {editedProduct.description}</Text>
        </View>
      </View>

      {!editMode && (
        <Button title="Edit" onPress={() => setEditMode(true)} />
      )}

      {editMode && (
        <View>
          <Text style={styles.modalTitle}>Edit Product</Text>

          <TextInput
            style={styles.input}
            placeholder="Product ID"
            value={editedProduct.id.toString()}
            onChangeText={(text) => setEditedProduct({ ...editedProduct, id: parseInt(text) })}
          />

          <TextInput
            style={styles.input}
            placeholder="Product Name"
            value={editedProduct.name}
            onChangeText={(text) => setEditedProduct({ ...editedProduct, name: text })}
          />

          <TextInput
            style={styles.input}
            placeholder="Product Category"
            value={editedProduct.category}
            onChangeText={(text) => setEditedProduct({ ...editedProduct, category: text })}
          />

          <TextInput
            style={styles.input}
            placeholder="Product Price"
            value={editedProduct.price.toString()}
            onChangeText={(text) => setEditedProduct({ ...editedProduct, price: parseFloat(text) })}
          />

          <TextInput
            style={styles.input}
            placeholder="Product Description"
            value={editedProduct.description}
            onChangeText={(text) => setEditedProduct({ ...editedProduct, description: text })}
          />

          <Button title="Save" onPress={handleEditProduct} />
          <Button title="Cancel" onPress={() => setEditMode(false)} />
        </View>
      )}

      <View style={styles.navigationContainer}>
        <Button title="First" onPress={handleFirst} />
        <Button title="Previous" onPress={handlePrevious} />
        <Button title="Next" onPress={handleNext} />
        <Button title="Last" onPress={handleLast} />
      </View>
    </View>
  );
};

const Stack = createStackNavigator();

const App = () => {
  const [products, setProducts] = useState([
    // initial product data
  ]);

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="ProductList">
          {(props) => <ProductListScreen {...props} setProducts={setProducts} />}
        </Stack.Screen>
        <Stack.Screen name="ProductDetails">
          {(props) => <ProductDetailsScreen {...props} setProducts={setProducts} />}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    borderBottomColor:'black',
    borderBottomWidth:0.5,
  },
  contentContainer: {
    backgroundColor: '#f5f5f5',
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  addButton: {
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'top',
    marginTop:60,
    padding: 20,
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
  },
  deleteButton: {
    position: 'absolute',
    top: 30,
    right: 10,
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 5,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sortContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  sortButton: {
    flex: 1,
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#f5f5f5',
    marginHorizontal: 5,
    alignItems: 'center',
  },
  activeSortButton: {
    backgroundColor: 'blue',
  },
  sortButtonText: {
    fontWeight: 'bold',
  },
  activeSortButtonText: {
    color: 'white',
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  cardContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  card: {
    width: '80%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },

});

export default App;
