import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, Modal,
  SafeAreaView,
  Platform
} from 'react-native';
import Toast from 'react-native-toast-message';
import 'react-native-get-random-values'; // 👈 must be first
import { v4 as uuidv4 } from 'uuid';
import {
  getAllExpenses,
  insertExpense,
  updateExpense,
  deleteExpense,
} from '../../db/expenseModel';
import { syncExpensesWithBackend } from '../../utils/syncManager';
import type { ExpenseRecord } from '../../db/expenseModel';
import { Feather, AntDesign, MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

const CRUDScreen = () => {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [isSynced, setIsSynced] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [records, setRecords] = useState<ExpenseRecord[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [type, setType] = useState('expense');
  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    const data = await getAllExpenses();
    setRecords(data);
  };

  const resetForm = () => {
    setTitle('');
    setAmount('');
    setDate(new Date());
    setIsSynced(false);
    setEditingId(null);
  };

  const handleAddOrUpdate = async () => {
    if (!title || !amount) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please fill out both fields',
      });
      return;
    }
    const payload = {
      id: editingId || uuidv4(),
      title,
      amount: parseInt(amount),
      is_synced: 0, // Mark as not synced
      is_deleted: 0, // Mark as not deleted
      date: date.toISOString(), // Store the date as a string
      type: type, // Store the type of transaction
    };
    if (editingId) {
      await updateExpense(payload as any);
    } else {
      await insertExpense(payload as any);
    }

    resetForm();
    setIsVisible(false);
    await loadExpenses();
  };

  const handleEdit = (item: ExpenseRecord) => {
    setTitle(item.title);
    setAmount(item.amount.toString());
    setIsSynced(Boolean(item.is_synced));
    setEditingId(item.id);
    setIsVisible(true);
    setDate(new Date(item.date)); // Set the date from the item
    setType(item.type); // Set the type from the item
  };

  const handleDelete = async (id: string) => {
    await deleteExpense(id);
    await loadExpenses();
  };

  const handleSync = async () => {
    await syncExpensesWithBackend();
    await loadExpenses();
    Toast.show({
      type: 'success',
      text1: 'Sync Successful',
      text2: 'All unsynced expenses have been synced with the Remote.',
    });

  };
  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowPicker(Platform.OS === "ios");
    if (selectedDate) setDate(selectedDate);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={styles.heading}>💸 Wellcome Back Business Man</Text>
        <TouchableOpacity style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: 'white', borderWidth: 1, borderColor: 'blue', alignItems: 'center', justifyContent: 'center' }} onPress={handleSync}>
          <MaterialIcons name="loop" size={24} color="black" />
        </TouchableOpacity>
      </View>


      <FlatList
        data={records}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListHeaderComponent={() => {
          const totalExpense = records
            .filter(record => record.type === 'expense')
            .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

          const totalIncome = records
            .filter(record => record.type === 'income')
            .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

          const savings = totalIncome - totalExpense;

          return (
            <View style={[styles.item, { flexDirection: 'column', gap: 10 }]}>

              <View style={styles.switchRow}>
                <Text style={{ fontSize: 18, fontFamily: 'bold', color: '#333' }}>
                  Summary for {new Date().toLocaleString('en-IN', { month: 'long', year: 'numeric' })}
                </Text>
              </View>

              <View style={styles.switchRow}>
                <Text style={{ fontFamily: 'bold' }} >
                  Total Transactions: {records.length}
                </Text>
              </View>
              <View style={styles.switchRow}>
                <Text style={{ fontFamily: 'bold' }}>
                  Total Expense:
                </Text>
                <Text style={{ color: 'green', fontFamily: 'bold' }}>
                  {totalExpense.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                </Text>
              </View>
              <View style={styles.switchRow}>
                <Text style={{ fontFamily: 'bold' }}>
                  Total Income:
                </Text>
                <Text style={{ color: 'green', fontFamily: 'bold' }}>
                  {totalIncome.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                </Text>
              </View>
              <View style={styles.switchRow}>
                <Text style={{ fontFamily: 'bold' }}>
                  Savings:
                </Text>
                <Text
                  style={{
                    color: savings < 0 ? 'red' : 'green', fontFamily: 'bold'
                  }}
                >
                  {savings.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                </Text>

              </View>
            </View>
          );
        }}


        ListEmptyComponent={() => (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 }}>
            <Text style={{ fontSize: 18, color: '#999' }}>No records found</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>

              {item.type === 'expense' ? (
                // <Feather name="arrow-down" size={24} color="red" />
                <AntDesign name="minuscircle" size={24} color="red" />
              ) : (
                // <Feather name="arrow-up" size={24} color="green" />
                <AntDesign name="pluscircle" size={24} color="green" />
              )}
              <Text style={styles.amount}>₹{item.amount}</Text>
              <View>
                <Text style={styles.text}>{item.title}</Text>

                <Text style={styles.subText}>
                  Synced: {item.is_synced ? '✅' : '❌'}
                </Text>
                <Text style={styles.subText}>
                  Date: {new Date(item.date).toLocaleDateString()}
                </Text>
              </View>
            </View>


            <View style={styles.actions}>
              <TouchableOpacity onPress={() => handleEdit(item)} style={styles.iconBtn}>
                <Feather name="edit" size={18} color="#333" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.iconBtn}>
                <Feather name="trash-2" size={18} color="red" />
              </TouchableOpacity>
            </View>
          </View>
        )}

      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          setEditingId(null);
          setTitle('');
          setAmount('');
          setIsVisible(true);
        }}
      >
        <AntDesign name="plus" size={24} color="white" />
      </TouchableOpacity>

      <Modal visible={isVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={styles.modalTitle}>{editingId ? 'Update Expense' : 'Add Expense'}</Text>
              <TouchableOpacity onPress={() => setIsVisible(false)} >
                <AntDesign name="close" size={24} color="black" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Title"
              value={title}
              onChangeText={setTitle}
            />
            <TextInput
              style={styles.input}
              placeholder="Amount"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
            />

            <TouchableOpacity onPress={() => setShowPicker(true)}>
              <View style={[styles.input, { flexDirection: 'row', gap: 5 }]} >

                <AntDesign name="calendar" size={24} color="black" />
                <View>
                  <Text

                  >{`${date.toLocaleDateString()}`}</Text>
                </View>
              </View>
            </TouchableOpacity>
            <View style={styles.switchRow}>
              <TouchableOpacity
                onPress={() => setType('income')}
                style={{
                  flex: 1,
                  backgroundColor: type === 'income' ? '#0BFDA6' : '#ccc',
                  paddingVertical: 12,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: 'green',
                  alignItems: 'center',
                  marginRight: 8,
                }}
              >
                <Text style={{ color: type === 'income' ? 'black' : '#000', }}>Income</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setType('expense')}
                style={{
                  flex: 1,
                  backgroundColor: type === 'expense' ? '#FF7755' : '#ccc',
                  paddingVertical: 12,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: 'green',
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: type === 'expense' ? '#FFF' : '#000' }}>Expense</Text>
              </TouchableOpacity>
            </View>



            {showPicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display="default"
                onChange={onDateChange}
              />
            )}
            <View style={styles.modalButtons}>
              <TouchableOpacity style={{ width: '100%', height: 50, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', borderRadius: 20, borderWidth: 1, borderColor: 'blue' }} onPress={handleAddOrUpdate} >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  {editingId ?
                    <MaterialIcons name="update" size={24} color="blue" /> :
                    <AntDesign name="pluscircleo" size={24} color="blue" />}
                  <Text style={{ color: 'blue', fontSize: 16, fontWeight: 'bold' }}>
                    {editingId ? 'Update' : 'Add'}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F2F5', padding: 20, paddingTop: 30 },
  heading: { fontSize: 24, fontFamily: 'bold', marginBottom: 20, color: '#333' },

  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  switchRow: {
    gap: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  item: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  text: { fontSize: 16, fontFamily: 'bold', color: '#333' },
  amount: { fontSize: 16, fontFamily: 'bold', color: '#555' },
  subText: { fontSize: 14, color: '#999' },
  actions: { flexDirection: 'row', gap: 15, marginTop: 10 },
  iconBtn: {
    padding: 6,
    backgroundColor: '#F2F2F2',
    borderRadius: 6,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#007AFF',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    // padding: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  modalCard: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    padding: 20,
    elevation: 5,
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, color: '#222' },
  modalButtons: {
    marginTop: 10,
    gap: 10,
  },
});

export default CRUDScreen;
