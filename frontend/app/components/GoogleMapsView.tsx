import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const GoogleMapsView = ({ incident }: { incident: any }) => {
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

  const getPriorityColor = (priority: string) => {
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
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  mapContainer: {
    flex: 1,
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: 300,
  },
  noLocationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noLocationText: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    marginTop: 12,
  },
  incidentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  incidentAddress: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 8,
  },
  coordinates: {
    fontSize: 12,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: 'monospace',
  },
  priorityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 20,
  },
  priorityText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  openMapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2196F3',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  openMapButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default GoogleMapsView;