import React, { useState } from 'react';
import { TextField, Button, Grid, Box, CircularProgress } from '@mui/material';
import { MapPin } from 'lucide-react';
import { useAuth } from '@hooks/useAuth';
import { shipmentAPI } from '@services/api';
import { validateCheckpointForm } from '@utils/validation';
import { toast } from 'react-toastify';

const AddCheckpoint = ({ shipmentId, onSuccess, onCancel }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    location: '',
    remarks: '',
    latitude: '',
    longitude: '',
    temperature: '',
    humidity: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData((prev) => ({
            ...prev,
            latitude: position.coords.latitude.toFixed(6),
            longitude: position.coords.longitude.toFixed(6),
          }));
          toast.success('Location captured!');
        },
        (error) => {
          console.error('Geolocation error:', error);
          toast.error('Failed to get location');
        }
      );
    } else {
      toast.error('Geolocation not supported');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate
    const validation = validateCheckpointForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    try {
      setLoading(true);

      await shipmentAPI.addCheckpoint(shipmentId, {
        location: formData.location,
        remarks: formData.remarks,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        temperature: formData.temperature ? parseInt(formData.temperature) : 0,
        humidity: formData.humidity ? parseInt(formData.humidity) : 0,
      });

      onSuccess();
    } catch (error) {
      console.error('Add checkpoint error:', error);
      toast.error('Failed to add checkpoint');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Location Name"
            name="location"
            value={formData.location}
            onChange={handleChange}
            error={!!errors.location}
            helperText={errors.location}
            placeholder="e.g., Distribution Center, Highway Rest Stop"
            required
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={2}
            label="Remarks (Optional)"
            name="remarks"
            value={formData.remarks}
            onChange={handleChange}
            placeholder="Add any notes or observations..."
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            type="number"
            label="Latitude"
            name="latitude"
            value={formData.latitude}
            onChange={handleChange}
            error={!!errors.latitude}
            helperText={errors.latitude}
            inputProps={{ step: '0.000001' }}
            required
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            type="number"
            label="Longitude"
            name="longitude"
            value={formData.longitude}
            onChange={handleChange}
            error={!!errors.longitude}
            helperText={errors.longitude}
            inputProps={{ step: '0.000001' }}
            required
          />
        </Grid>

        <Grid item xs={12}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<MapPin />}
            onClick={getCurrentLocation}
          >
            Use Current Location
          </Button>
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            type="number"
            label="Temperature (°C) - Optional"
            name="temperature"
            value={formData.temperature}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            type="number"
            label="Humidity (%) - Optional"
            name="humidity"
            value={formData.humidity}
            onChange={handleChange}
            inputProps={{ min: 0, max: 100 }}
          />
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button onClick={onCancel} disabled={loading}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              startIcon={loading && <CircularProgress size={16} />}
            >
              {loading ? 'Adding...' : 'Add Checkpoint'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </form>
  );
};

export default AddCheckpoint;