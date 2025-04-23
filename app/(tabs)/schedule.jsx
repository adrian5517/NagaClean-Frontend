import React, { useEffect, useState } from 'react';
import * as Location from 'expo-location';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Modal,
} from 'react-native';

export default function Schedule() {
  const [pickupData, setPickupData] = useState([]);
  const [form, setForm] = useState({
    name: '',
    description: '',
    wasteType: '',
    date: '',
    time: '',
    reported_by: '',
    location: '', // location field
  });
  const [editingItem, setEditingItem] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [status, setStatus] = useState('');
  const [showAll, setShowAll] = useState(false);
  const baseUrl = 'https://nagappon-server.onrender.com/api/pickups';

  useEffect(() => {
    fetchPickups();
    if (!editingItem) {
      getLocation(); // Get location if not editing
    }
  }, [editingItem]);

  const fetchPickups = async () => {
    try {
      const res = await fetch(baseUrl);
      const data = await res.json();
      setPickupData(data);
    } catch (error) {
      console.error('Failed to fetch pickups:', error.message);
    }
  };

  const getLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission to access location was denied');
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
    const coords = `${location.coords.latitude}, ${location.coords.longitude}`;
    setForm((prevForm) => ({ ...prevForm, location: coords }));
  };

  const handleChange = (name, value) => {
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async () => {
    const { name, description, wasteType, date, time, reported_by, location } = form;
    if (!name || !description || !wasteType || !date || !time || !reported_by || !location) {
      Alert.alert('Please fill in all fields including location');
      return;
    }

    try {
      const response = await fetch(
        editingItem ? `${baseUrl}/${editingItem._id}` : baseUrl,
        {
          method: editingItem ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editingItem ? { ...form, status } : form),
        }
      );
      if (!response.ok) throw new Error('Something went wrong');

      Alert.alert(editingItem ? 'Pickup updated!' : 'Pickup created!');
      setForm({
        name: '',
        description: '',
        wasteType: '',
        date: '',
        time: '',
        reported_by: '',
        location: '',
      });
      setEditingItem(null);
      setModalVisible(false);
      fetchPickups();
      if (!editingItem) {
        getLocation(); // Refresh location for next form
      }
    } catch (error) {
      console.error('Error:', error.message);
    }
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setForm({
      name: item.name,
      description: item.description,
      wasteType: item.wasteType,
      date: item.date,
      time: item.time,
      reported_by: item.reported_by,
      location: item.location || '', // Use existing location if available
    });
    setStatus(item.status || '');
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    Alert.alert('Delete Pickup', 'Are you sure?', [
      { text: 'Cancel' },
      {
        text: 'Yes',
        onPress: async () => {
          try {
            await fetch(`${baseUrl}/${id}`, { method: 'DELETE' });
            Alert.alert('Deleted');
            fetchPickups();
          } catch (error) {
            console.error('Delete error:', error.message);
          }
        },
      },
    ]);
  };

  const isFormDisabled = pickupData.length >= 1 && !editingItem;
  const visiblePickups = showAll ? pickupData : pickupData.slice(0, 1);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>{editingItem ? 'Edit Pickup' : 'Create New Pickup'}</Text>

      <View style={styles.form}>
        {[ 
          { field: 'name', placeholder: 'Enter Name' },
          { field: 'description', placeholder: 'Enter Description' },
          { field: 'wasteType', placeholder: 'Enter Waste Type' },
          { field: 'date', placeholder: 'Enter Date (YYYY-MM-DD)' },
          { field: 'time', placeholder: 'Enter Time (e.g., 14:00)' },
          { field: 'reported_by', placeholder: 'Reported By' },
        ].map(({ field, placeholder }) => (
          <TextInput
            key={field}
            style={styles.input}
            placeholder={placeholder}
            value={form[field]}
            onChangeText={(val) => handleChange(field, val)}
            editable={!isFormDisabled}
          />
        ))}

        <Text style={{ marginBottom: 10 }}>
          Location: {form.location || 'Fetching...'}
        </Text>

        <TouchableOpacity
          style={[styles.button, isFormDisabled ? { backgroundColor: '#ccc' } : {}]}
          onPress={handleSubmit}
          disabled={isFormDisabled}
        >
          <Text style={styles.buttonText}>{editingItem ? 'Update' : 'Create'}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.heading}>Pickups</Text>

      {visiblePickups.map((item) => (
        <View style={styles.card} key={item._id}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <Text>Description: {item.description}</Text>
          <Text>Waste Type: {item.wasteType}</Text>
          <Text>Date: {item.date}</Text>
          <Text>Time: {item.time}</Text>
          <Text>Reported by: {item.reported_by}</Text>
          <Text>Status: {item.status || 'Pending'}</Text>
          <Text>Location: {item.location || 'Not available'}</Text>
          <View style={styles.row}>
            <TouchableOpacity style={styles.editBtn} onPress={() => openEditModal(item)}>
              <Text style={styles.btnText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item._id)}>
              <Text style={styles.btnText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}

      {pickupData.length > 1 && (
        <TouchableOpacity onPress={() => setShowAll(!showAll)} style={styles.toggleBtn}>
          <Text style={styles.toggleText}>
            {showAll ? 'Collapse' : 'View All'}
          </Text>
        </TouchableOpacity>
      )}

      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.heading}>Edit Pickup</Text>
          {[ 
            { field: 'name', placeholder: 'Enter Name' },
            { field: 'description', placeholder: 'Enter Description' },
            { field: 'wasteType', placeholder: 'Enter Waste Type' },
            { field: 'date', placeholder: 'Enter Date (YYYY-MM-DD)' },
            { field: 'time', placeholder: 'Enter Time' },
            { field: 'reported_by', placeholder: 'Reported By' },
          ].map(({ field, placeholder }) => (
            <TextInput
              key={field}
              style={styles.input}
              placeholder={placeholder}
              value={form[field]}
              onChangeText={(val) => handleChange(field, val)}
            />
          ))}
          <TextInput
            style={styles.input}
            placeholder="Enter Status"
            value={status}
            onChangeText={setStatus}
          />
          <Text style={{ marginBottom: 10 }}>
            Location: {form.location || 'Fetching...'}
          </Text>
          <View style={styles.row}>
            <TouchableOpacity style={styles.editBtn} onPress={handleSubmit}>
              <Text style={styles.btnText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => {
                setModalVisible(false);
                setEditingItem(null);
              }}
            >
              <Text style={styles.btnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#0066cc',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 10,
  },
  editBtn: {
    backgroundColor: '#4caf50',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  deleteBtn: {
    backgroundColor: '#f44336',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  btnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  toggleBtn: {
    alignItems: 'center',
    marginVertical: 10,
  },
  toggleText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#007aff',
  },
});
