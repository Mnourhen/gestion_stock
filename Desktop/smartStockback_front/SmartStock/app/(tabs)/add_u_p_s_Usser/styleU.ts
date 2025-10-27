import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
safeArea: { flex: 1, backgroundColor: '#F5EFE8' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 5 },
  input: {
    flex: 1, height: 50, fontSize: 16, color: '#333', borderWidth: 1,
    borderColor: '#E0E0E0', borderRadius: 10, paddingHorizontal: 10,
  },
  iconButton: { padding: 10 },
  addButton: { backgroundColor: '#6B3E2E', padding: 15, borderRadius: 10, alignItems: 'center' },
  addButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  toggleGroup: {
    flexDirection: 'row', justifyContent: 'space-around', backgroundColor: 'white',
    borderRadius: 15, padding: 5, marginBottom: 20,
  },
  toggleButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 10, borderWidth: 1 },
  activeToggleButton: { backgroundColor: '#6B3E2E', borderColor: '#6B3E2E' },
  inactiveToggleButton: { backgroundColor: 'transparent', borderColor: 'transparent' },
  toggleButtonText: { fontSize: 16, fontWeight: '600' },
  formSection: { backgroundColor: 'white', borderRadius: 15, padding: 15, marginBottom: 30 },
  sectionTitle: { fontWeight: 'bold', color: '#5C4033', marginTop: 10 },
  profileButtonGroup: { gap: 15, marginBottom: 20 },
  profileButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderRadius: 12, paddingVertical: 14, gap: 10, backgroundColor: '#FFF',
    borderWidth: 1, borderColor: '#E3D2C4',
  },
  profileText: { color: '#5C4033', fontWeight: '600', fontSize: 15 },


 overlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
     scanArea: { width: 250, height: 250, borderWidth: 2, borderColor: 'white', borderRadius: 10 },
      cancelContainer: { flex: 1, justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 50 },
       cancelButton: { backgroundColor: '#6B3E2E', padding: 12, borderRadius: 10, width: 200, alignItems: 'center' },
        cancelText: { color: '#fff', fontWeight: 'bold' }, 
        permissionContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' }, 
        permissionButton: { marginTop: 10, color: 'blue', fontWeight: 'bold' },


card: { backgroundColor: '#fff',
         borderWidth: 1, 
         borderColor: '#e3c9b0', 
         borderRadius: 10,
          padding: 2,
           margin: 2,
            marginTop:10,
             shadowColor: '#000', 
             shadowOpacity: 0.05, 
             shadowOffset: { width: 0, height: 2 },
              shadowRadius: 4, elevation: 2, }, 
header: {
   flexDirection: 'row',
   justifyContent: 'space-between',
   alignItems: 'center',
  borderBottomWidth: 0.5,
  borderBottomColor: '#e0c5a8',
   paddingBottom: 5, marginBottom: 8, },
 refresh: { fontSize: 12, color: '#c07d45',
 fontWeight: '500', },
searchContainer: { 
  flexDirection: 'row', 
  alignItems: 'center', 
  backgroundColor: '#faf4ee',
   borderRadius: 8, paddingHorizontal: 8, 
   marginBottom: 10, height: 35, }, 
searchInput: { 
  flex: 1, fontSize: 13, color: '#333', },
cell: {
  flex: 1,
  textAlign: 'center',
  fontSize: 13,
  color: '#333',
  paddingVertical: 4,
  borderRightWidth: 1,       // ✅ bordure verticale
  borderColor: '#ecd6b9',
},
 table: {
  borderWidth: 1,
  borderColor: '#d9c7b0',
  borderRadius: 8,
  overflow: 'hidden',
  marginTop: 5,
},

row: {
  flexDirection: 'row',
  alignItems: 'center', // ✅ centre verticalement
  borderBottomWidth: 1,
  borderColor: '#f1e1d0',
  paddingVertical: 8,
  paddingHorizontal: 4,
},

headerRow: {
  backgroundColor: '#f4e3d2',
  borderBottomWidth: 2,
  borderColor: '#d4b48f',
},



headerText: {
  fontWeight: 'bold',
  fontSize: 13,
  color: '#5C4033',
  textAlign: 'center',
},
title:{},
   });