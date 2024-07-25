import React, { useState, useEffect, useCallback } from "react";
import { View, Text, SafeAreaView, Image, TextInput, Pressable, StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";
import { theme } from "../theme";
import { CalendarDaysIcon, MagnifyingGlassIcon } from "react-native-heroicons/outline";
import { MapPinIcon } from "react-native-heroicons/solid";
import { ScrollView } from "react-native";
import { debounce } from 'lodash';
import { fetchWeatherForecast, fetchlocations } from "../api/weather";
import { weatherImages } from "../constants";
import * as Progress from 'react-native-progress';
import { getData, storeData } from "../utils/asyncStorage";
import DropDownPicker from 'react-native-dropdown-picker';
import { useTranslation } from 'react-i18next';
import i18n from "../i18n";

export default function HomeScreen() {
  const { t } = useTranslation();
  const [language, setLanguage] = useState('en');
  const [showSearch, setShowSearch] = useState(false);
  const [locations, setLocations] = useState([]);
  const [weather, setWeather] = useState({});
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([
    { label: 'English', value: 'en' },
    { label: 'हिंदी', value: 'hi' },
    { label: 'తెలుగు', value: 'te' },
  ]);

  const handleLocation = (loc) => {
    setLocations([]);
    setShowSearch(false);
    fetchWeatherForecast({
      cityName: loc.name,
      days: '7'
    }).then(data => {
      setWeather(data);
      setLoading(false);
      storeData('city', loc.name);
    });
  };

  const handleSearch = value => {
    if (value.length > 2) {
      fetchlocations({ cityName: value }).then(data => {
        setLocations(data);
      });
    }
  };

  useEffect(() => {
    fetchInitialWeatherData();
  }, []);

  const fetchInitialWeatherData = async () => {
    let myCity = await getData('city');
    let cityName = 'Hyderabad';
    if (myCity) cityName = myCity;

    fetchWeatherForecast({
      cityName,
      days: '7'
    }).then(data => {
      setWeather(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    i18n.changeLanguage(language);
  }, [language]);

  const handleTextDebounce = useCallback(debounce(handleSearch, 1200), []);

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    i18n.changeLanguage(lang);
  };

  const { current, location, forecast } = weather;

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Image
        blurRadius={70}
        source={require('../assets/images/bg.png')}
        style={styles.backgroundImage}
      />
      {loading ? (
        <View style={styles.loadingContainer}>
          <Progress.CircleSnail thickness={10} size={140} color="#0bb3b2" />
        </View>
      ) : (
        <SafeAreaView style={styles.safeArea}>
          {/* Language Dropdown */}
          <View>
            <Text style={styles.languageLabel}>{t('hello')}</Text>
            <DropDownPicker
              open={open}
              value={language}
              items={items}
              setOpen={setOpen}
              setValue={setLanguage} // Update this line to set the value directly
              setItems={setItems}
              onChangeValue={handleLanguageChange} // Add this prop to handle language change
              containerStyle={styles.languageDropdownContainer}
              style={styles.languageDropdown}
              dropDownStyle={styles.languageDropdownList}
              labelStyle={styles.languageDropdownText}
            />
          </View>

          {/* Search section */}
          <View style={styles.searchSection}>
            <View style={[
              styles.searchBar,
              { backgroundColor: showSearch ? theme.bgWhite(0.2) : 'transparent' }
            ]}
            >
              {showSearch && (
                <TextInput
                  onChangeText={handleTextDebounce}
                  placeholder={t('search_city')}
                  placeholderTextColor={'lightgray'}
                  style={styles.textInput}
                />
              )}
              <Pressable
                style={[styles.searchButton, { backgroundColor: theme.bgWhite(0.3) }]}
                onPress={() => setShowSearch(!showSearch)}
              >
                <MagnifyingGlassIcon size="25" color="white" />
              </Pressable>
            </View>
            {locations.length > 0 && showSearch ? (
              <View style={styles.locationDropdown}>
                {locations.map((loc, index) => {
                  let showBorder = index + 1 !== locations.length;
                  return (
                    <Pressable
                      onPress={() => handleLocation(loc)}
                      key={index}
                      style={[
                        styles.locationItem,
                        showBorder && styles.locationItemBorder
                      ]}
                    >
                      <MapPinIcon size={20} color="grey" />
                      <Text style={styles.locationText}>{loc?.name}, {loc?.country}</Text>
                    </Pressable>
                  );
                })}
              </View>
            ) : null}
          </View>
          {/* Forecast section */}
          <View style={styles.forecastSection}>
            {/* Location */}
            <Text style={styles.locationText}>
              {location?.name},
              <Text style={styles.countryText}>
                {" " + location?.country}
              </Text>
            </Text>
            {/* Weather image */}
            <View style={styles.weatherImageContainer}>
              <Image
                source={weatherImages[current?.condition?.text] || weatherImages['other']}
                style={styles.weatherImage}
              />
            </View>
            {/* Degree Celsius */}
            <View style={styles.degreeSection}>
              <Text style={styles.degreeText}>
                {current?.temp_c}&#176;
              </Text>
              <Text style={styles.weatherDescription}>
                {current?.condition?.text}
              </Text>
            </View>
            {/* Other stats */}
            <View style={styles.statsSection}>
              <View style={styles.statItem}>
                <Image source={require('../assets/icons/wind.png')} style={styles.statIcon} />
                <Text style={styles.statText}>
                  {current?.wind_kph}km
                </Text>
              </View>
              <View style={styles.statItem}>
                <Image source={require('../assets/icons/drop.png')} style={styles.statIcon} />
                <Text style={styles.statText}>
                  {current?.humidity}%
                </Text>
              </View>
              <View style={styles.statItem}>
                <Image source={require('../assets/icons/sun.png')} style={styles.statIcon} />
                <Text style={styles.statText}>
                  {weather?.forecast?.forecastday[0]?.astro?.sunrise}
                </Text>
              </View>
            </View>
          </View>

          {/* Forecast for next day */}
          <View style={styles.forecastDayContainer}>
            <View style={styles.forecastDayHeader}>
              <CalendarDaysIcon size="22" color="white" />
              <Text style={styles.forecastDayText}>{t('daily_forecast')}</Text>
            </View>
            <ScrollView
              horizontal
              contentContainerStyle={styles.forecastDayScrollView}
              showsHorizontalScrollIndicator={false}
            >
              {forecast?.forecastday.map((item, index) => {
                let date = new Date(item.date);
                let options = { weekday: 'short' };
                let dayName = date.toLocaleDateString('en-US', options);
                dayName = dayName.split(',')[0];

                return (
                  <View key={index} style={styles.forecastDayItem}>
                    <Image
                      source={weatherImages[item?.day?.condition?.text] || weatherImages['other']}
                      style={styles.forecastDayImage}
                    />
                    <Text style={styles.forecastDayLabel}>
                      {dayName}
                    </Text>
                    <Text style={styles.forecastDayTemp}>
                      {item?.day?.avgtemp_c}&#176;
                    </Text>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        </SafeAreaView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E1E', // Dark background color for a modern look
    position: 'relative'
  },
  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0.6, // Slight transparency to blend with the background
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
  },
  safeArea: {
    flex: 1,
    paddingTop: 20,
    paddingHorizontal: 15,
  },
  languageLabel: {
    color: '#F8F8F8',
    fontSize: 16,
    fontWeight: 'bold',
  },
  languageDropdownContainer: {
    height: 40,
    width: 150,
    marginVertical: 10,
    zIndex: 1000,
  },
  languageDropdown: {
    backgroundColor: 'transparent',
    borderColor: '#F8F8F8',
  },
  languageDropdownList: {
    backgroundColor: '#2C2C2C',
    borderColor: '#F8F8F8',
  },
  languageDropdownText: {
    fontSize: 16,
    color: '#F8F8F8',
  },
  searchSection: {
    marginVertical: 20,
    flexDirection: 'row-reverse',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 50,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  textInput: {
    flex: 1,
    height: 40,
    color: '#F8F8F8',
  },
  searchButton: {
    borderRadius: 50,
    padding: 8,
    marginLeft: 10,
  },
  locationDropdown: {
    position: 'absolute',
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    top: 50,
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  locationItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#444',
  },
  locationText: {
    color: '#F8F8F8',
    fontSize: 14,
    marginLeft: 10,
  },
  forecastSection: {
    marginVertical: 20,
    padding: 15,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  locationText: {
    color: '#F8F8F8',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  countryText: {
    color: '#A5A5A5',
    fontSize: 20,
    fontWeight: 'bold',
  },
  weatherImageContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 20,
  },
  weatherImage: {
    width: 200,
    height: 200,
  },
  degreeSection: {
    alignItems: 'center',
    marginVertical: 10,
  },
  degreeText: {
    color: '#F8F8F8',
    fontSize: 60,
    fontWeight: 'bold',
  },
  weatherDescription: {
    color: '#A5A5A5',
    fontSize: 20,
    marginTop: 5,
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statIcon: {
    width: 30,
    height: 30,
    marginBottom: 5,
  },
  statText: {
    color: '#F8F8F8',
    fontSize: 16,
  },
  forecastDayContainer: {
    marginVertical: 20,
    padding: 15,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  forecastDayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  forecastDayText: {
    color: '#F8F8F8',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  forecastDayScrollView: {
    paddingHorizontal: 10,
  },
  forecastDayItem: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    paddingVertical: 15,
    borderRadius: 10,
    marginHorizontal: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  forecastDayImage: {
    width: 50,
    height: 50,
    marginBottom: 10,
  },
  forecastDayLabel: {
    color: '#F8F8F8',
    fontSize: 14,
  },
  forecastDayTemp: {
    color: '#F8F8F8',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
