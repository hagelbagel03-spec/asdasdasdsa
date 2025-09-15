import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const GoogleMapsView = ({ incident }) => {
  // Fixed colors instead of theme context
  const colors = {
    text: '#1a1a1a',
    textMuted: '#6c757d',
    background: '#ffffff',
    surface: '#f8f9fa',
    border: '#e9ecef',
    primary: '#2196F3',
    error: '#DC3545',
    warning: '#FFC107',
    success: '#28A745'
  };

  // Get coordinates from incident
  const getCoordinates = () => {
    if (incident?.location?.lat && incident?.location?.lng) {
      return {
        lat: parseFloat(incident.location.lat),
        lng: parseFloat(incident.location.lng)
      };
    }
    if (incident?.coordinates?.lat && incident?.coordinates?.lng) {
      return {
        lat: parseFloat(incident.coordinates.lat),
        lng: parseFloat(incident.coordinates.lng)
      };
    }
    return null;
  };

  const coordinates = getCoordinates();

  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return colors.error;
      case 'medium': return colors.warning;
      case 'low': return colors.success;
      default: return colors.primary;
    }
  };

  if (!coordinates) {
    return (
      <View style={styles.container}>
        <View style={styles.noLocationContainer}>
          <Ionicons name="location-outline" size={32} color={colors.textMuted} />
          <Text style={styles.noLocationText}>
            Keine GPS-Koordinaten verfügbar
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        <View style={styles.mapPlaceholder}>
          <Ionicons name="location" size={48} color={getPriorityColor(incident.priority)} />
          <Text style={styles.incidentTitle}>📍 {incident.title}</Text>
          <Text style={styles.incidentAddress}>{incident.address}</Text>
          <Text style={styles.coordinates}>
            🧭 {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
          </Text>
          
          <View style={[styles.priorityBadge, {
            backgroundColor: getPriorityColor(incident.priority)
          }]}>
            <Text style={styles.priorityText}>
              {incident.priority?.toUpperCase() || 'NORMAL'} PRIORITÄT
            </Text>
          </View>

          <TouchableOpacity 
            style={styles.openMapButton}
            onPress={() => {
              const url = `https://www.google.com/maps?q=${coordinates.lat},${coordinates.lng}&z=16`;
              Alert.alert(
                '🗺️ In Google Maps öffnen',
                `Möchten Sie den Vorfall-Standort in Google Maps öffnen?\n\n📍 ${incident.address}\n🧭 ${coordinates.lat.toFixed(6)}, ${coordinates.lng.toFixed(6)}`,
                [
                  { text: 'Abbrechen', style: 'cancel' },
                  { 
                    text: 'Maps öffnen', 
                    onPress: () => {
                      if (typeof window !== 'undefined') {
                        window.open(url, '_blank');
                      }
                    }
                  }
                ]
              );
            }}
          >
            <Ionicons name="open-outline" size={16} color="#FFFFFF" />
            <Text style={styles.openMapButtonText}>Google Maps öffnen</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default GoogleMapsView;