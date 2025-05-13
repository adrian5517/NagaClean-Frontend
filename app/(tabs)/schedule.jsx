import React, { useEffect, useState } from 'react';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Modal,
  ActivityIndicator,
  Dimensions,
  Platform,
} from 'react-native';

export default function Schedule() {
  const [pickupData, setPickupData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    wasteType: '',
    date: '',
    time: '',
    reported_by: '',
    location: '',
  });
  const [errors, setErrors] = useState({});
  const [editingItem, setEditingItem] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [status, setStatus] = useState('');
  const [showAll, setShowAll] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [region, setRegion] = useState({
    latitude: 13.6191,
    longitude: 123.1814,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [markerPosition, setMarkerPosition] = useState({
    latitude: 13.6191,
    longitude: 123.1814,
  });
  const [isDragging, setIsDragging] = useState(false);
  const baseUrl = 'https://nagappon-server.onrender.com/api/pickups';

  useEffect(() => {
    fetchPickups();
    if (!editingItem) {
      getLocation();
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

    try {
      let location = await Location.getCurrentPositionAsync({});
      const newRegion = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };
      setRegion(newRegion);
      setMarkerPosition({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      setForm((prevForm) => ({
        ...prevForm,
        location: `${location.coords.latitude}, ${location.coords.longitude}`,
      }));
    } catch (error) {
      Alert.alert('Error', 'Failed to get location');
    }
  };

  const onMarkerDragStart = () => {
    setIsDragging(true);
  };

  const onMarkerDragEnd = (e) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setMarkerPosition({ latitude, longitude });
    setForm((prevForm) => ({
      ...prevForm,
      location: `${latitude}, ${longitude}`,
    }));
    setIsDragging(false);
  };

  const handleChange = (name, value) => {
    setForm({ ...form, [name]: value });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Name is required';
    if (!form.description.trim()) newErrors.description = 'Description is required';
    if (!form.wasteType.trim()) newErrors.wasteType = 'Waste type is required';
    if (!form.date.trim()) newErrors.date = 'Date is required';
    if (!form.time.trim()) newErrors.time = 'Time is required';
    if (!form.reported_by.trim()) newErrors.reported_by = 'Reporter name is required';
    if (!form.location) newErrors.location = 'Location is required';

    // Date format validation
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (form.date && !dateRegex.test(form.date)) {
      newErrors.date = 'Date must be in YYYY-MM-DD format';
    }

    // Time format validation
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (form.time && !timeRegex.test(form.time)) {
      newErrors.time = 'Time must be in HH:MM format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please check the form for errors');
      return;
    }

    setLoading(true);
    try {
      // Parse location string into latitude and longitude
      const [latitude, longitude] = form.location.split(',').map(coord => parseFloat(coord.trim()));
      
      // Format date to ISO string
      const dateObj = new Date(form.date);
      const formattedDate = dateObj.toISOString();

      // Create the submission data matching the API format
      const submissionData = {
        name: form.name,
        latitude: latitude,
        longitude: longitude,
        description: form.description,
        date: formattedDate,
        time: form.time,
        wasteType: form.wasteType,
        reported_by: form.reported_by,
        status: editingItem ? status : 'pending'
      };

      // Log the request payload for debugging
      console.log('Submitting form data:', submissionData);

      const response = await fetch(
        editingItem ? `${baseUrl}/${editingItem._id}` : baseUrl,
        {
          method: editingItem ? 'PUT' : 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(submissionData),
        }
      );
      
      // Log the response status and headers
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      const responseData = await response.json();
      console.log('Response data:', responseData);

      if (!response.ok) {
        throw new Error(
          responseData.message || 
          responseData.error || 
          `Server error: ${response.status}`
        );
      }

      Alert.alert(
        'Success',
        editingItem ? 'Pickup updated successfully!' : 'Pickup created successfully!',
        [{ 
          text: 'OK', 
          onPress: () => {
            setForm({
              name: '',
              description: '',
              wasteType: '',
              date: '',
              time: '',
              reported_by: '',
              location: '',
            });
            setSelectedDate(new Date());
            setSelectedTime(new Date());
            setEditingItem(null);
            setModalVisible(false);
            fetchPickups();
            if (!editingItem) {
              getLocation();
            }
          }
        }]
      );
    } catch (error) {
      console.error('Submit error details:', {
        message: error.message,
        stack: error.stack,
        form: form
      });
      
      let errorMessage = 'Failed to save pickup';
      if (error.message.includes('Network')) {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (error.message.includes('Server error')) {
        errorMessage = 'Server error. Please try again later.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert(
        'Error',
        errorMessage,
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatTime = (date) => {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const handleDateChange = (date) => {
    try {
      setSelectedDate(date);
      setForm(prev => ({
        ...prev,
        date: formatDate(date)
      }));
    } catch (error) {
      console.error('Date change error:', error);
      Alert.alert('Error', 'Failed to update date');
    }
  };

  const handleTimeChange = (time) => {
    try {
      setSelectedTime(time);
      setForm(prev => ({
        ...prev,
        time: formatTime(time)
      }));
    } catch (error) {
      console.error('Time change error:', error);
      Alert.alert('Error', 'Failed to update time');
    }
  };

  const DatePickerModal = () => (
    <Modal
      visible={showDatePicker}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowDatePicker(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Select Date</Text>
          
          <View style={styles.dateControls}>
            <TouchableOpacity
              style={styles.dateControlButton}
              onPress={() => {
                const newDate = new Date(selectedDate);
                newDate.setMonth(newDate.getMonth() - 1);
                handleDateChange(newDate);
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.dateControlText}>◀</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.dateDisplay}
              onPress={() => {
                const today = new Date();
                handleDateChange(today);
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.dateControlButton}
              onPress={() => {
                const newDate = new Date(selectedDate);
                newDate.setMonth(newDate.getMonth() + 1);
                handleDateChange(newDate);
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.dateControlText}>▶</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.dateQuickSelect}>
            <TouchableOpacity
              style={styles.quickSelectButton}
              onPress={() => {
                const today = new Date();
                handleDateChange(today);
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.quickSelectText}>Today</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickSelectButton}
              onPress={() => {
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                handleDateChange(tomorrow);
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.quickSelectText}>Tomorrow</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickSelectButton}
              onPress={() => {
                const nextWeek = new Date();
                nextWeek.setDate(nextWeek.getDate() + 7);
                handleDateChange(nextWeek);
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.quickSelectText}>Next Week</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setShowDatePicker(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.confirmButton]}
              onPress={() => setShowDatePicker(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.modalButtonText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const TimePickerModal = () => (
    <Modal
      visible={showTimePicker}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowTimePicker(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Select Time</Text>
          
          <View style={styles.timeControls}>
            <View style={styles.timeColumn}>
              <TouchableOpacity
                style={styles.timeControlButton}
                onPress={() => {
                  const newTime = new Date(selectedTime);
                  newTime.setHours(newTime.getHours() - 1);
                  handleTimeChange(newTime);
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.timeControlText}>▲</Text>
              </TouchableOpacity>
              
              <Text style={styles.timeText}>
                {String(selectedTime.getHours()).padStart(2, '0')}
              </Text>
              
              <TouchableOpacity
                style={styles.timeControlButton}
                onPress={() => {
                  const newTime = new Date(selectedTime);
                  newTime.setHours(newTime.getHours() + 1);
                  handleTimeChange(newTime);
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.timeControlText}>▼</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.timeSeparator}>:</Text>

            <View style={styles.timeColumn}>
              <TouchableOpacity
                style={styles.timeControlButton}
                onPress={() => {
                  const newTime = new Date(selectedTime);
                  newTime.setMinutes(newTime.getMinutes() - 15);
                  handleTimeChange(newTime);
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.timeControlText}>▲</Text>
              </TouchableOpacity>
              
              <Text style={styles.timeText}>
                {String(selectedTime.getMinutes()).padStart(2, '0')}
              </Text>
              
              <TouchableOpacity
                style={styles.timeControlButton}
                onPress={() => {
                  const newTime = new Date(selectedTime);
                  newTime.setMinutes(newTime.getMinutes() + 15);
                  handleTimeChange(newTime);
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.timeControlText}>▼</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.timeQuickSelect}>
            <TouchableOpacity
              style={styles.quickSelectButton}
              onPress={() => {
                const now = new Date();
                handleTimeChange(now);
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.quickSelectText}>Now</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickSelectButton}
              onPress={() => {
                const morning = new Date(selectedTime);
                morning.setHours(9, 0, 0);
                handleTimeChange(morning);
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.quickSelectText}>9:00 AM</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickSelectButton}
              onPress={() => {
                const afternoon = new Date(selectedTime);
                afternoon.setHours(14, 0, 0);
                handleTimeChange(afternoon);
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.quickSelectText}>2:00 PM</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setShowTimePicker(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.confirmButton]}
              onPress={() => setShowTimePicker(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.modalButtonText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const openEditModal = (item) => {
    setEditingItem(item);
    const itemDate = item.date ? new Date(item.date) : new Date();
    const itemTime = item.time ? new Date(`2000-01-01T${item.time}`) : new Date();
    
    setSelectedDate(itemDate);
    setSelectedTime(itemTime);
    setForm({
      name: item.name,
      description: item.description,
      wasteType: item.wasteType,
      date: item.date,
      time: item.time,
      reported_by: item.reported_by,
      location: item.location || '',
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

  const visiblePickups = showAll ? pickupData : pickupData.slice(0, 1);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.heading}>{editingItem ? 'Edit Pickup' : 'Create New Pickup'}</Text>
      </View>

      <View style={styles.form}>
        {[ 
          { field: 'name', placeholder: 'Enter Place', label: 'Place' },
          { field: 'description', placeholder: 'Enter Description', label: 'Description' },
          { field: 'wasteType', placeholder: 'Enter Waste Type', label: 'Waste Type' },
          { field: 'reported_by', placeholder: 'Reported By', label: 'Reporter' },
        ].map(({ field, placeholder, label }) => (
          <View key={field} style={styles.inputContainer}>
            <Text style={styles.label}>{label}</Text>
            <TextInput
              style={[styles.input, errors[field] && styles.inputError]}
              placeholder={placeholder}
              value={form[field]}
              onChangeText={(val) => {
                handleChange(field, val);
                if (errors[field]) {
                  setErrors(prev => ({ ...prev, [field]: null }));
                }
              }}
              placeholderTextColor="#999"
            />
            {errors[field] && <Text style={styles.errorText}>{errors[field]}</Text>}
          </View>
        ))}

        {/* Date Picker */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Date</Text>
          <TouchableOpacity
            style={[styles.input, styles.pickerInput]}
            onPress={() => setShowDatePicker(true)}
            activeOpacity={0.7}
          >
            <Text style={[styles.pickerText, !form.date && styles.placeholderText]}>
              {form.date || 'Select Date'}
            </Text>
          </TouchableOpacity>
          {errors.date && <Text style={styles.errorText}>{errors.date}</Text>}
        </View>

        {/* Time Picker */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Time</Text>
          <TouchableOpacity
            style={[styles.input, styles.pickerInput]}
            onPress={() => setShowTimePicker(true)}
            activeOpacity={0.7}
          >
            <Text style={[styles.pickerText, !form.time && styles.placeholderText]}>
              {form.time || 'Select Time'}
            </Text>
          </TouchableOpacity>
          {errors.time && <Text style={styles.errorText}>{errors.time}</Text>}
        </View>

        <View style={styles.locationContainer}>
          <Text style={styles.label}>Location</Text>
          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              region={region}
              onRegionChangeComplete={setRegion}
            >
              <Marker
                coordinate={markerPosition}
                draggable
                onDragStart={onMarkerDragStart}
                onDragEnd={onMarkerDragEnd}
                pinColor="#0d6efd"
              >
                <View style={styles.markerContainer}>
                  <View style={[styles.marker, isDragging && styles.markerDragging]}>
                    <Text style={styles.markerText}>📍</Text>
                  </View>
                  <View style={[styles.markerShadow, isDragging && styles.markerShadowDragging]} />
                </View>
              </Marker>
            </MapView>
            <View style={styles.mapOverlay}>
              <Text style={styles.mapInstructions}>
                {isDragging ? 'Drop to set location' : 'Drag the pin to set exact location'}
              </Text>
            </View>
          </View>
          <View style={styles.locationDetails}>
            <Text style={styles.locationLabel}>Selected Location:</Text>
            <Text style={styles.locationText}>
              {form.location || 'Select location on map'}
            </Text>
            <Text style={styles.coordinatesText}>
              {form.location ? `Lat: ${markerPosition.latitude.toFixed(6)}, Long: ${markerPosition.longitude.toFixed(6)}` : ''}
            </Text>
          </View>
          {errors.location && <Text style={styles.errorText}>{errors.location}</Text>}
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>
              {editingItem ? 'Update' : 'Create'}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <DatePickerModal />
      <TimePickerModal />

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
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#212529',
  },
  inputError: {
    borderColor: '#dc3545',
  },
  errorText: {
    color: '#dc3545',
    fontSize: 12,
    marginTop: 4,
  },
  locationContainer: {
    marginBottom: 16,
  },
  mapContainer: {
    height: 250,
    marginVertical: 10,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#dee2e6',
    position: 'relative',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  mapOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 8,
    alignItems: 'center',
  },
  mapInstructions: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  markerContainer: {
    alignItems: 'center',
  },
  marker: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ translateY: -20 }],
  },
  markerDragging: {
    transform: [{ translateY: -30 }, { scale: 1.2 }],
  },
  markerText: {
    fontSize: 32,
  },
  markerShadow: {
    width: 20,
    height: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 10,
    transform: [{ translateY: -10 }],
  },
  markerShadowDragging: {
    width: 30,
    height: 6,
    transform: [{ translateY: -15 }],
  },
  locationDetails: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  locationLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 4,
  },
  locationText: {
    fontSize: 14,
    color: '#212529',
    marginBottom: 4,
  },
  coordinatesText: {
    fontSize: 12,
    color: '#6c757d',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  button: {
    backgroundColor: '#0d6efd',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: '#6c757d',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 12,
  },
  editBtn: {
    backgroundColor: '#198754',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  deleteBtn: {
    backgroundColor: '#dc3545',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  btnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  toggleBtn: {
    alignItems: 'center',
    padding: 16,
  },
  toggleText: {
    color: '#0d6efd',
    fontSize: 16,
    fontWeight: '600',
  },
  pickerInput: {
    justifyContent: 'center',
    height: 50,
  },
  pickerText: {
    fontSize: 16,
    color: '#212529',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    color: '#1a1a1a',
  },
  dateControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  dateControlButton: {
    backgroundColor: '#0d6efd',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  dateControlText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  dateDisplay: {
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    minWidth: 150,
    alignItems: 'center',
  },
  dateText: {
    fontSize: 18,
    color: '#1a1a1a',
    fontWeight: '500',
  },
  dateQuickSelect: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  quickSelectButton: {
    backgroundColor: '#e9ecef',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginHorizontal: 4,
  },
  quickSelectText: {
    color: '#495057',
    fontSize: 14,
    fontWeight: '500',
  },
  timeControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  timeColumn: {
    alignItems: 'center',
  },
  timeControlButton: {
    backgroundColor: '#0d6efd',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 8,
  },
  timeControlText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  timeSeparator: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginHorizontal: 10,
  },
  timeText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a1a1a',
    minWidth: 60,
    textAlign: 'center',
  },
  timeQuickSelect: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  confirmButton: {
    backgroundColor: '#0d6efd',
  },
  cancelButtonText: {
    color: '#6c757d',
    fontSize: 16,
    fontWeight: '600',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  placeholderText: {
    color: '#999',
  },
});
