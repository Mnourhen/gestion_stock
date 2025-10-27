
import { StyleSheet } from "react-native";
export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F4EF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  connectionStatus: {
    fontSize: 9,
    textAlign: 'center',
  },
  connectionSuccess: {
    color: '#4CAF50',
  },
  connectionError: {
    color: '#F44336',
  },
  retryButton: {
    marginTop: 15,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
 
 
  nameText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
 
  profilePlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#000',
  },
  searchLoading: {
    marginLeft: 10,
  },
  searchResults: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  searchResultsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000',
  },
  searchResultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  productCategory: {
    fontSize: 12,
    color: '#666',
  },
  productDetails: {
    alignItems: 'flex-end',
  },
  productPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 2,
  },
  productStock: {
    fontSize: 11,
    color: '#666',
  },
  transactionsSection: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionIconText: {
    fontSize: 18,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  transactionType: {
    fontSize: 14,
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: '#666',
  },
  noTransactions: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    marginVertical: 20,
  },
 
 
  header: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  backgroundColor: '#F9F4EF',
  paddingVertical: 10,
  paddingHorizontal: 15,
  borderRadius: 15,
  marginBottom: 25,
  shadowColor: '#000',
  shadowOpacity: 0.1,
  shadowOffset: { width: 0, height: 2 },
  shadowRadius: 4,
  elevation: 5,
},
 image: {
    width: 60,
    height: 60,
  },

headerLeft: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 10,
},

welcomeText: {
  color: '#5C4033',
  fontSize: 14,
},

usernameText: {
  color: '#5C4033',
  fontSize: 16,
  fontWeight: 'bold',
},

headerRight: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 10,
},

addButtonHeader: {
  backgroundColor: '#5C4033',
  paddingVertical: 6,
  paddingHorizontal: 14,
  borderRadius: 8,
},

addText: {
  color: '#FFF',
  fontWeight: 'bold',
  fontSize: 14,
},

logoutButton: {
  padding: 8,
},

});

